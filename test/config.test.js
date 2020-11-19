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

import { getConfig } from '../phabtab/src/config.js'

describe('getConfig', () => {
  test('basic functionality', async () => {
    chrome.storage.sync.get.mockImplementation(
      (keys, callback) => {
        callback({
          url: 'https://phabricator.example.com/',
          apitoken: 'api-foo'
        })
      }
    )

    const config = await getConfig()
    expect(config).toEqual({
      url: 'https://phabricator.example.com/',
      apitoken: 'api-foo'
    })
  })

  test('adds slash to url', async () => {
    chrome.storage.sync.get.mockImplementation(
      (keys, callback) => {
        callback({ url: 'https://phabricator.example.com' })
      }
    )

    const config = await getConfig()
    expect(config).toEqual({ url: 'https://phabricator.example.com/' })
  })

  test('works without url', async () => {
    chrome.storage.sync.get.mockImplementation(
      (keys, callback) => {
        callback({ apitoken: 'api-foo' })
      }
    )

    const config = await getConfig()
    expect(config).toEqual({ apitoken: 'api-foo' })
  })
})
