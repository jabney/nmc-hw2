const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const lib = {}

// Base directory for log files.
lib.baseDir = path.join(__dirname, '../.logs')

// Create the base directory if it does not already exist.
if (!fs.existsSync(lib.baseDir)) {
  fs.mkdirSync(lib.baseDir)
}

/**
 * @param {string} file
 * @param {string} str
 * @param {(error: Error) => void} callback
 */
lib.append = function append(file, str, callback) {
  const filePath = `${lib.baseDir}/${file}.log`
  const ws = fs.createWriteStream(filePath, { flags: 'a'})

  ws.write(str + '\n', (error) => {
    if (error) {
      return callback(error)
    }
  })

  ws.end(callback)
}

/**
 * List log files
 *
 * @param {boolean} includeCompressed
 * @param {(error: Error, data?: string[]) => void} callback
 */
lib.list = function list(includeCompressed, callback) {
  fs.readdir(`${lib.baseDir}`, (dirError, files) => {
    if (dirError) {
      return callback(dirError)
    }

    let fileNames = files

    // Filter out compressed log files.
    if (!includeCompressed) {
      fileNames = fileNames.filter(x => !/\.gz\.b64$/.test(x))
    }

    callback(null, fileNames.map(x => x.replace(/\.log|\.gz\.b64/g, '')))
  })
}

lib.compress = function compress(logId, newFileId, callback) {
  const sourceFile = `${logId}.log`
  const destFile = `${newFileId}.gz.b64`

  // Read the source file from disk.
  fs.readFile(`${lib.baseDir}/${sourceFile}`, (readErr, data) => {
    if (readErr) {
      return callback(readErr)
    }

    // Gzip the data.
    zlib.gzip(data, (cmpErr, buffer) => {
      if (cmpErr) {
        return callback(cmpErr)
      }

      // Encode as base64.
      const encoded = buffer.toString('base64')

      // Write encoded data to file.
      fs.writeFile(`${lib.baseDir}/${destFile}`, encoded, (writeErr) => {
        if (writeErr) {
          return callback(writeErr)
        }

        callback(null)
      })
    })
  })
}

// lib.compress = function compress(logId, newFileId, callback) {
//   const sourceFile = `${logId}.log`
//   const destFile = `${newFileId}.gz.b64`
//   const gzip = zlib.createGzip()
//   const base64encode = new Base64Encode()

//   try {
//     const inp = fs.createReadStream(`${lib.baseDir}/${sourceFile}`)
//     const out = fs.createWriteStream(`${lib.baseDir}/${destFile}`)

//     inp.pipe(gzip).pipe(base64encode).pipe(out)
//     callback(null)
//   } catch (error) {
//     callback(error)
//   }
// }

/**
 * @param {string} fileId
 * @param {(error: Error, data?: string) => void} callback
 */
lib.decompress = function compress(fileId, callback) {
  const fileName = `${fileId}.gz.b64`

  fs.readFile(`${lib.baseDir}/${fileName}`, 'utf8', (readErr, str) => {
    if (readErr) {
      return callback(readErr)
    }

    const decoded = Buffer.from(str, 'base64')

    zlib.unzip(decoded, (unzipErr, buffer) => {
      if (unzipErr) {
        return callback(unzipErr)
      }

      callback(null, buffer.toString())
    })
  })
}

/**
 * @param {string} logId
 * @param {(error: Error, data?: string) => void} callback
 */
lib.truncate = function truncate(logId, callback) {
  const fileName = `${logId}.log`

  fs.truncate(`${lib.baseDir}/${fileName}`, (truncErr) => {
    if (truncErr) {
      return callback(truncErr)
    }

    callback(null)
  })

}

module.exports = lib
