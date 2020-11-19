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

import * as storage from '../phabtab/src/storage.js'

describe('storage', () => {
  let contents = {}

  beforeEach(() => {
    contents = {}

    chrome.storage.local.set.mockImplementation((dict) => {
      Object.assign(contents, dict)
    })

    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {}
      for (const key of keys) {
        if (key in contents) {
          result[key] = contents[key]
        } else {
          result[key] = null
        }
      }
      callback(result)
    })
  })

  test('getState with nothing set', async () => {
    const state = await storage.getState()
    expect(state).toEqual(null)
  })

  test('setState/getState with nothing set', async () => {
    storage.setState({ hello: 'world ', foo: 'bar' })
    const state = await storage.getState()
    expect(state).toEqual({ hello: 'world ', foo: 'bar' })
  })
})
