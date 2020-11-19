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

import * as phab from '../phabtab/src/phabricator.js'

jest.useFakeTimers()

describe('post', () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  test('basic functionality', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

    const result = await phab.post('https://phab.example.com', 'api/transaction.search', 'api-foo', {
      objectIdentifier: 'PHID12345',
      after: 'xyz'
    }, 100)

    expect(result.data).toEqual('12345')

    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual('https://phab.example.com/api/transaction.search')
    expect(fetch.mock.calls[0][1].method).toEqual('POST')
    expect(fetch.mock.calls[0][1].cache).toEqual('no-cache')
    expect(fetch.mock.calls[0][1].credentials).toEqual('omit')
    expect(fetch.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' })
    expect(fetch.mock.calls[0][1].referrerPolicy).toEqual('no-referrer')
    expect(fetch.mock.calls[0][1].body).toEqual('api.token=api-foo&objectIdentifier=PHID12345&after=xyz')
  })

  test('keeps single slash after base URL ending in slash', async () => {
    fetch.mockResponseOnce(JSON.stringify({ data: '12345' }))

    const result = await phab.post('https://phab.example.com/', 'api/transaction.search', 'api-foo', {}, 100)

    expect(result.data).toEqual('12345')

    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual('https://phab.example.com/api/transaction.search')
  })

  test('respects timeout', async () => {
    fetch.mockResponseOnce(async () => {
      jest.advanceTimersByTime(200)
      return ''
    })

    await expect(phab.post('https://phab.example.com/', '', 'api-foo', {}, 100)).rejects.toThrow()

    expect(fetch.mock.calls.length).toEqual(1)
    expect(fetch.mock.calls[0][0]).toEqual('https://phab.example.com/')
  })
})

describe('getUsername', () => {
  test('fetches username', async () => {
    chrome.cookies.getAll.mockImplementation((options, callback) => {
      callback([{ name: 'abcd-phusr', value: 'foo' }])
    })

    const username = await phab.getUsername()
    expect(username).toEqual('foo')
  })

  test('returns null if no username is set', async () => {
    chrome.cookies.getAll.mockImplementation((options, callback) => {
      callback([{ name: 'randomcookie', value: 'foo' }])
    })

    const username = await phab.getUsername()
    expect(username).toEqual(null)
  })

  test('returns null if no cookies are stored at all', async () => {
    chrome.cookies.getAll.mockImplementation((options, callback) => {
      callback([])
    })

    const username = await phab.getUsername()
    expect(username).toEqual(null)
  })
})
