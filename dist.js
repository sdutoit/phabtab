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

const archiver = require('archiver')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

const root = 'phabtab'

const manifestData = fs.readFileSync(`${root}/manifest.json`)
const manifest = JSON.parse(manifestData)

const outdir = `${root}-${manifest.version}`
const filename = `${outdir}.zip`

const outFile = fs.createWriteStream(filename)
const archive = archiver('zip')

archive.pipe(outFile)

glob(`${root}/**`, { nodir: true }, (err, filenames) => {
  if (err) {
    throw err
  }
  for (const filename of filenames) {
    const relpath = path.relative(root, filename)
    archive.file(filename, { name: relpath })
  }
  archive.finalize()

  console.log(`Distribution written to ${filename}`)
})
