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

export function prereqsUnmet () {
  chrome.browserAction.setBadgeText({ text: '?' })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#777' })
}

export function error () {
  chrome.browserAction.setBadgeText({ text: '!' })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#c22' })
}

export function inProgress () {
  chrome.browserAction.setBadgeText({ text: '⏳' })
  chrome.browserAction.setBadgeBackgroundColor({ color: '#48f' })
}

export function reviews (numReviews) {
  if (numReviews > 0) {
    chrome.browserAction.setBadgeText({ text: numReviews > 99 ? '∞' : `${numReviews}` })
    chrome.browserAction.setBadgeBackgroundColor({ color: '#2c29cf' })
  } else {
    chrome.browserAction.setBadgeText({ text: '' })
  }
}
