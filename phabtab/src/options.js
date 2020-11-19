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

function isValidHttpUrl (string) {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

function isValidApiToken (token) {
  return /^api-[a-z0-9]{28}$/.test(token)
}

function loadOptions () {
  chrome.storage.sync.get({
    url: '',
    apitoken: ''
  }, options => {
    $('#url').val(options.url)
    $('#apitoken').val(options.apitoken)
  })
}

function validateOptions () {
  let valid = true

  const url = $('#url').val()
  if (url.length > 0 && !isValidHttpUrl(url)) {
    $('#label-url').addClass('invalid')
    valid = false
  } else {
    $('#label-url').removeClass('invalid')
  }

  const apitoken = $('#apitoken').val()
  if (apitoken.length > 0 && !isValidApiToken(apitoken)) {
    $('#label-apitoken').addClass('invalid')
    valid = false
  } else {
    $('#label-apitoken').removeClass('invalid')
  }

  return valid
}

function saveOptions () {
  if (!validateOptions()) {
    return
  }

  for (const key of ['url', 'apitoken']) {
    const value = $(`#${key}`).val()
    if (value.length > 0) {
      chrome.storage.sync.set({ [key]: value })
    } else {
      chrome.storage.sync.remove(key)
    }
  }

  chrome.runtime.sendMessage({
    event: 'reloadRequested'
  })

  window.close()
}

$(document).ready(() => {
  loadOptions()

  $('#save').click(() => {
    saveOptions()
  })
})
