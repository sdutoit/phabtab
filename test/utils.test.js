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
'use strict'

import { fetchWithTimeout } from '../phabtab/src/utils.js'

describe('fetchWithTimeout', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  test('works like a normal fetch if it does not time out', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

    const response = await fetchWithTimeout('https://example.com/', { timeout: 100, method: 'POST' })
    const json = await response.json()
    expect(json.data).toEqual('12345')

    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual('https://example.com/')
    expect(fetch.mock.calls[0][1].method).toEqual('POST')
  })

  test('aborts on time out', async () => {
    jest.useFakeTimers()

    fetch.mockResponseOnce(async () => {
      jest.advanceTimersByTime(200)
      return ''
    })

    await expect(fetchWithTimeout('https://example.com/', { timeout: 100 })).rejects.toThrow()
  })
})
