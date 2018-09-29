/**
 * Library for storing and editing data.
 */
const fs = require('fs')
const path = require('path')

/**
 * @typedef {any} Data
 */

/**
 * @typedef {(error: Error, data?: Data) => void} DataCallback
 */

/**
 * @typedef {(dir: string, file: string, data: Data, callback: DataCallback) => void} Create
 */

/**
 * @typedef {(dir: string, file: string, callback: DataCallback) => void} Read
 */

/**
 * @typedef {(dir: string, file: string, data: Data, callback: DataCallback) => void} Update
 */
/**
 *
 * @typedef {(dir: string, file: string, callback: DataCallback) => void} Delete
 */

/**
 * @typedef {(dir: string, callback: DataCallback) => void} List
 */

/**
 * @typedef {Object} DataLib
 * @property {string} baseDir
 * @property {Create} create
 * @property {Read} read
 * @property {Update} update
 * @property {Delete} delete
 * @property {List} list
 */

/**
 * Create the export container.
 *
 * @type {DataLib}
 */
var lib = {}

// Folder base directory
lib.baseDir = path.join(__dirname, '../.data')

// Create the base directory if it does not already exist.
if (!fs.existsSync(lib.baseDir)) {
  fs.mkdirSync(lib.baseDir)
}

/**
 * Write data to a file
 *
 * @type {Create}
 */
lib.create = function create(dir, file, data, callback) {
  const filePath = `${lib.baseDir}/${dir}/${file}.json`

  fs.readFile(filePath, (readErr, buffer) => {
    if (buffer) {
      return callback(new Error(`<storage> file already exists "${file}"`))
    }

    if (readErr) {
      if (readErr.code !== 'ENOENT') {
        console.error(readErr)
        return callback(new Error(`<storage> error reading "${file}"`))
      }

      fs.writeFile(filePath, JSON.stringify(data), (writeErr) => {
        if (writeErr) {
          console.error(writeErr)
          return callback(new Error(`<storage> error writing "${file}"`))
        }

        callback(null)
      })
    }
  })
}

/**
 * Read data from file
 *
 * @type {Read}
 */
lib.read = function read(dir, file, callback) {
  fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf-8', (err, data) => {
    if (err) {
      return callback(err)
    }

    callback(null, JSON.parse(data))
  })
}

/**
 * Update an existing record.
 *
 * @type {Update}
 */
lib.update = function update(dir, file, data, callback) {
  const filePath = `${lib.baseDir}/${dir}/${file}.json`

  fs.readFile(filePath, (readErr, buffer) => {
    if (readErr) {
      if (readErr.code === 'ENOENT') {
        return callback(new Error(`<storage> file does not exist "${file}"`))
      }

      console.log(readErr)
      return callback(new Error(`<storage> error reading file "${file}"`))
    }

    fs.writeFile(filePath, JSON.stringify(data), (writeErr) => {
      if (writeErr) {
        console.error(writeErr)
        return callback(new Error(`<storage> error writing file "${file}"`))
      }

      callback(null)
    })
  })
}

/**
 * Delete a file.
 *
 * @type {Delete}
 */
lib.delete = function _delete(dir, file, callback) {
  // Unlink the file
  fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => {
    if (err) {
      return callback(new Error('Could not delete file'))
    }

    return callback(null)
  })
}

/**
 * List files in a directory.
 *
 * @type {List} callback
 */
lib.list = function list(dir, callback) {
  fs.readdir(`${lib.baseDir}/${dir}`, (dirError, files) => {
    if (dirError) {
      return callback(dirError)
    }

    callback(null, files.map(x => x.replace(/\.json$/, '')))
  })
}

module.exports = lib
