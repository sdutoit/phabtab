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

import { fetchWithTimeout } from './utils.js'

export async function post (baseurl, api, key, params, timeout) {
  let data = `api.token=${key}`
  for (const paramKey in params) {
    data += `&${paramKey}=${params[paramKey]}`
  }

  const url = baseurl + (baseurl.endsWith('/') ? '' : '/') + api

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    referrerPolicy: 'no-referrer',
    body: data,
    timeout: timeout
  })
  return await response.json()
}

export function getUsername (baseurl) {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ url: baseurl }, cookies => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message || 'Unable to fetch phabricator user!'))
      } else {
        if (cookies.length === 0) {
          resolve(null)
          return
        }

        for (const cookie of cookies) {
          // TODO: what do we do if there are multiple such cookies?
          // TODO: the cookie still exists when we're actually logged out.
          if (cookie.name.endsWith('phusr')) {
            resolve(cookie.value)
            return
          }
        }

        resolve(null)
      }
    })
  })
}

export async function getTransactions (config, phid, timeout) {
  let transactions = []
  let after = null
  do {
    const params = { objectIdentifier: phid }
    if (after !== null) {
      params.after = after
    }
    const response = await post(config.url, 'api/transaction.search',
      config.apitoken, params, timeout)
    after = response.result.cursor.after

    transactions = transactions.concat(response.result.data)
  } while (after !== null)

  transactions = transactions.sort((left, right) => {
    if (left.dateModified < right.dateModified) {
      return 1
    } else if (left.dateModified > right.dateModified) {
      return -1
    } else {
      return 0
    }
  })

  return transactions
}
