// Copyright 2020 Stefanus Du Toit
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import { getConfig, isConfigComplete } from './config.js'
import { getUrlPermissions } from './permissions.js'
import * as phab from './phabricator.js'
import * as state from './state.js'

let stateUpdateInProgress = false
const fetchTimeout = 5000

function needsAttention (transactions, myPhid, authorPhid) {
  for (const tx of transactions) {
    if (tx.authorPHID === myPhid) {
      return false
    } else if (tx.authorPHID === authorPhid) {
      return true
    }
  }

  return true
}

export async function attemptStateUpdate () {
  if (stateUpdateInProgress) {
    return
  }

  stateUpdateInProgress = true

  try {
    state.inProgress()

    const config = await getConfig()
    if (!isConfigComplete(config)) {
      state.prereqsUnmet('config')
      return
    }

    const permissionsGranted = await getUrlPermissions(config.url)
    if (!permissionsGranted) {
      state.prereqsUnmet('perms')
      return
    }

    const username = await phab.getUsername(config.url)
    if (username === null) {
      state.prereqsUnmet('login')
      return
    }

    const userResponse = await phab.post(config.url, 'api/user.search',
      config.apitoken, { 'constraints[usernames][0]': username }, fetchTimeout)
    const phid = userResponse.result.data[0].phid

    const projectResponse = await phab.post(config.url, 'api/project.search',
      config.apitoken, { 'constraints[members][0]': phid }, fetchTimeout)
    const projects = {}
    for (const project of projectResponse.result.data) {
      projects[project.phid] = { name: project.fields.name }
    }

    const reviews = {}

    // Fetch all the reviews addressed directly to us
    const reviewResponse = await phab.post(config.url, 'api/differential.revision.search',
      config.apitoken, {
        'constraints[reviewerPHIDs][0]': phid,
        'constraints[statuses][0]': 'needs-review'
      }, fetchTimeout)
    for (const review of reviewResponse.result.data) {
      reviews[review.phid] = {
        review: review,
        type: 'direct',
        projects: [],
        needsAttention: needsAttention(
          await phab.getTransactions(config, review.phid, fetchTimeout),
          phid,
          review.fields.authorPHID
        )
      }
    }

    // Fetch all the reviews we've sent out that have been accepted
    const acceptedResponse = await phab.post(config.url, 'api/differential.revision.search',
      config.apitoken, {
        'constraints[authorPHIDs][0]': phid,
        'constraints[statuses][0]': 'accepted'
      }, fetchTimeout)
    for (const review of acceptedResponse.result.data) {
      reviews[review.phid] = {
        review: review,
        type: 'accepted',
        projects: [],
        needsAttention: true
      }
    }

    // Fetch all of the group (aka project) reviews for groups we belong to.
    for (const projectPhid in projects) {
      const projectReviewResponse = await phab.post(config.url, 'api/differential.revision.search',
        config.apitoken, {
          'constraints[reviewerPHIDs][0]': projectPhid,
          'constraints[statuses][0]': 'needs-review'
        }, fetchTimeout)
      for (const review of projectReviewResponse.result.data) {
        if (review.fields.authorPHID === phid) {
          // Skip reviews authored by us
          continue
        }
        if (review.phid in reviews) {
          reviews[review.phid].projects.push(projects[projectPhid].name)
        } else {
          reviews[review.phid] = {
            review: review,
            projects: [projects[projectPhid].name],
            type: 'group',
            needsAttention: needsAttention(
              await phab.getTransactions(config, review.phid, fetchTimeout),
              phid,
              review.fields.authorPHID
            )
          }
        }
      }
    }

    state.reviewsReady(reviews)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      state.fail('Request timed out.')
    } else {
      console.log(err)
      state.fail('Failed to retrieve updates.')
    }
  } finally {
    stateUpdateInProgress = false
  }
}
