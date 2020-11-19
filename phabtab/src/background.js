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

import { setupInstallHooks } from './install.js'
import { attemptStateUpdate } from './update.js'
import * as badge from './badge.js'
import * as state from './state.js'
import * as storage from './storage.js'

setupInstallHooks()

state.addListener(state => {
  storage.setState(state)
  if (state.status === 'error') {
    badge.error()
  } else if (state.status === 'in_progress') {
    badge.inProgress()
  } else if (state.status.startsWith('prereqs_unmet')) {
    badge.prereqsUnmet()
  } else if (state.status === 'done') {
    let count = 0
    for (const phid in state.reviews) {
      if (state.reviews[phid].needsAttention) {
        ++count
      }
    }
    badge.reviews(count)
  } else {
    badge.error()
  }

  chrome.runtime.sendMessage({
    event: 'stateUpdated'
  })
})

chrome.runtime.onMessage.addListener(message => {
  if (!('event' in message)) {
    return
  }

  if (message.event === 'reloadRequested') {
    attemptStateUpdate()
  }
})

chrome.alarms.onAlarm.addListener(alarm => {
  // Only update the state if the popup isn't currently showing.
  if (chrome.extension.getViews({ type: 'popup' }).length === 0) {
    attemptStateUpdate()
  }
})

chrome.permissions.onAdded.addListener(() => {
  attemptStateUpdate()
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create({ periodInMinutes: 1 })

  attemptStateUpdate()
})

chrome.runtime.onStartup.addListener(() => {
  attemptStateUpdate()
})
