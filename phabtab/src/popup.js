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
import { requestUrlPermissions } from './permissions.js'
import * as storage from './storage.js'

function makeReviewURL (baseurl, id) {
  return baseurl + (baseurl.endsWith('/') ? '' : '/') + 'D' + `${id}`
}

function showReviews (url, reviews) {
  $('#my-reviews').empty()
  $('#group-reviews').empty()
  $('#accepted-reviews').empty()

  if (Object.keys(reviews).length === 0) {
    $('#my-reviews').text('Nothing to do!').show()
    return
  }

  $('#my-reviews').append('<div>Reviews assigned to me:</div>')
  $('#group-reviews').append('<div>Reviews assigned to my groups:</div>')
  $('#accepted-reviews').append('<div>My accepted reviews:</div>')

  let haveOwnReviews = false
  let haveGroupReviews = false
  let haveAcceptedReviews = false
  for (let needsAttention = 1; needsAttention > -1; --needsAttention) {
    for (const phid in reviews) {
      if (!!needsAttention !== reviews[phid].needsAttention) {
        continue
      }
      const review = reviews[phid].review
      if (reviews[phid].type === 'direct') {
        haveOwnReviews = true
        $('#my-reviews').append(
          `<a href="${makeReviewURL(url, review.id)}">` +
          `<div class="review ${needsAttention ? 'attention' : ''}">` +
          `<span class="id">D${review.id}</span> ` +
          `<span class="title">${review.fields.title}</span>` +
          '</div></a>\n')
      } else if (reviews[phid].type === 'group') {
        haveGroupReviews = true

        let groups = ''
        for (const group of reviews[phid].projects) {
          if (groups.length !== 0) {
            groups += ', '
          }
          groups += '#' + group
        }

        $('#group-reviews').append(
          `<a href="${makeReviewURL(url, review.id)}">` +
          `<div class="review ${needsAttention ? 'attention' : ''}">` +
          `<span class="id">D${review.id}</span> ` +
          `<span class="title">${review.fields.title}</span>` +
          `<span class="groups">${groups}</span>` +
          '</div></a>\n')
      } else if (reviews[phid].type === 'accepted') {
        haveAcceptedReviews = true
        $('#accepted-reviews').append(
          `<a href="${makeReviewURL(url, review.id)}">` +
          '<div class="review accepted">' +
          `<span class="id">D${review.id}</span> ` +
          `<span class="title">${review.fields.title}</span>` +
          '</div></a>\n')
      }
    }
  }
  if (haveOwnReviews) {
    $('#my-reviews').show()
  }
  if (haveGroupReviews) {
    $('#group-reviews').show()
  }
  if (haveAcceptedReviews) {
    $('#accepted-reviews').show()
  }
}

async function updateUi () {
  $('.hideable').hide()

  try {
    const state = await storage.getState()
    if (state === undefined) {
      throw Error('state unavailable')
    }

    if (state.status === 'error') {
      $('#error').text(state.errorMessage).show()
    } else if (state.status === 'prereqs_unmet_config') {
      $('#config-needed').show()
    } else if (state.status === 'prereqs_unmet_perms') {
      $('#perms-needed').show()
    } else if (state.status === 'prereqs_unmet_login') {
      const config = await getConfig()
      $('#login-needed').html(`Not logged in to phabricator.
        <a href="${config.url}">Log in</a>.`).show()
    } else if (state.status === 'in_progress') {
      $('#in-progress').show()
    } else if (state.status === 'done') {
      const config = await getConfig()
      showReviews(config.url, state.reviews)
    } else {
      throw Error(`Unknown status: ${state.status}`)
    }
  } catch (err) {
    $('.hideable').hide()
    $('#error').text(`Internal error: ${err}`).show()
  }
}

function reload () {
  chrome.runtime.sendMessage({
    event: 'reloadRequested'
  })
}

$(document).ready(() => {
  $('body').on('click', 'a', function () {
    chrome.tabs.create({ url: $(this).attr('href') })
    return false
  })

  $('#open-config').click(() => {
    chrome.runtime.openOptionsPage()
    return false
  })

  $('#open-perms').click(() => {
    getConfig().then(config => {
      if (!isConfigComplete(config)) {
        return
      }
      requestUrlPermissions(config.url)
    })

    return false
  })

  $('#reload').click(() => {
    reload()
  })

  chrome.runtime.onMessage.addListener(message => {
    if (!('event' in message)) {
      return
    }

    if (message.event === 'stateUpdated') {
      updateUi()
    }
  })

  updateUi()
})
