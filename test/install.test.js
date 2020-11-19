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

/* eslint-env jest */
/* eslint-disable standard/no-callback-literal */
'use strict'

import { setupInstallHooks } from '../phabtab/src/install.js'

const flushPromises = () => new Promise(setImmediate)

describe('setupInstallHooks()', () => {
  afterEach(() => {
    chrome.runtime.onInstalled.clearListeners()
  })

  test('with no options set', async () => {
    chrome.storage.sync.get.mockImplementation(
      (keys, callback) => {
        callback({})
      }
    )

    setupInstallHooks()

    chrome.runtime.onInstalled.callListeners()
    await flushPromises()
    expect(chrome.runtime.openOptionsPage).toBeCalledTimes(1)
  })

  test('with some options set', async () => {
    chrome.storage.sync.get.mockImplementation(
      (keys, callback) => {
        callback({
          url: 'https://phabricator.example.com'
        })
      }
    )

    setupInstallHooks()

    chrome.runtime.onInstalled.callListeners()
    await flushPromises()
    expect(chrome.runtime.openOptionsPage).toBeCalledTimes(1)
  })

  test('with all options set', async () => {
    chrome.storage.sync.get.mockImplementation(
      (keys, callback) => {
        callback({
          url: 'https://phabricator.example.com',
          apitoken: 'api-foo'
        })
      }
    )

    setupInstallHooks()

    chrome.runtime.onInstalled.callListeners()
    await flushPromises()
    expect(chrome.runtime.openOptionsPage).not.toBeCalled()
  })
})
