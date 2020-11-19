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

const stateListeners = []
const state = {
  status: 'unset',
  errorMessage: undefined,
  reviews: []
}

function notifyStateUpdate () {
  for (const listener of stateListeners) {
    try {
      listener(state)
    } catch (err) {
      console.log(err)
    }
  }
}

export function addListener (fn) {
  stateListeners.push(fn)
}

export function fail (message) {
  console.log(`State update failed: ${message}`)

  state.status = 'error'
  state.errorMessage = message
  state.reviews = []
  notifyStateUpdate()
}

export function prereqsUnmet (type) {
  state.status = `prereqs_unmet_${type}`
  state.errorMessage = undefined
  state.reviews = []
  notifyStateUpdate()
}

export function inProgress () {
  state.status = 'in_progress'
  state.errorMessage = undefined
  state.reviews = []
  notifyStateUpdate()
}

export function reviewsReady (reviews) {
  state.status = 'done'
  state.errorMessage = undefined
  state.reviews = reviews
  notifyStateUpdate()
}
