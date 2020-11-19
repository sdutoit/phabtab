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

export function getState () {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['state'], result => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message || 'Unable to retrieve state!'))
      } else {
        resolve(result.state)
      }
    })
  })
}

export function setState (state) {
  chrome.storage.local.set({ state: state })
}
