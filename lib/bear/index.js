const fs = require('fs')
const path = require('path')

// Create charactermap for rendering the bear.
const charMap = { a: '8', b: '2', c: '1', d: 'v', e: ':', f: '.', g: ' '}

/**
 * @typedef {'pos'|'neg'} RenderType
 */

/**
 * Render the bear source image.
 *
 * @param {string} line
 */
function render(line) {
  return [...line].map((char) => charMap[char]).join('')
}

/**
 * Summon the bear.
 *
 * @returns {Promise<string[]>}
 */
function createBear() {
  return new Promise((resolve, reject) => {
    const fileName = path.join(__dirname, './data/grizzly.raw')
    const read = fs.createReadStream(fileName)
    const width = 80
    let buffer = new Buffer('')

    try {
      // Build the buffer as data is read in.
      read.on('data', (data) => buffer = Buffer.concat([data]))

      read.on('close', () => {
        const lines = []

        // Slice the buffer into lines.
        for (let i = 0; i < buffer.length / width; i++) {
          const offset = i * width
          const line = buffer.slice(offset, width + offset)
          lines.push(render(line.toString()))
        }

        resolve(lines)
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = createBear
