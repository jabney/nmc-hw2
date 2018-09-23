const util = require('util')

const storage = require('../lib/storage')
const timeMs = require('./time-ms')
const logs = require('./logs')
const api = require('../api/api')
const Token = require('../models/token.model')

const debug = util.debuglog('workers')

/**
 * @typedef {Token.TokenData} TokenData
 */

/**
 * @typedef {Object} Outcome
 * @property {Error} error
 * @property {number} responseCode
 */

/**
 * Log processing info to a file.
 *
 * @param {Token} token
 */
function log(token) {

  // Build the data object.
  const data = { token: token.serialize(), timestamp: Date.now() }

  // Convert data to a string.
  const dataStr = JSON.stringify(data)

  // Use id as the log file name.
  const fileName = token.id

  // Append to the log file.
  logs.append(fileName, dataStr, (error) => {
    if (error) {
      debug('error writing to log file')
    }
  })
}

/**
 * Remove a token from storage.
 *
 * @param {string} tokenId
 */
const deleteToken = async function deleteToken(tokenId) {

  const token = new Token(tokenId)

  try {
    // Try to load the token.
    await token.load()
  } catch (error) {
    debug(`<workers> error loading token "${tokenId}"`)
  }

  // Verify the token.
  if (!token.verify()) {
    debug(`<workers> deleting expired token "${tokenId}"`)

    try {
      await token.delete()
      log(token)
    } catch (error) {
      debug(`<workers> error deleting token "${tokenId}"`)
    }
  }
}

/**
 * Rotate and compress log files.
 */
const rotateLogs = function rotateLogs() {
  logs.list(false, (listErr, list) => {
    if (listErr) {
      return debug('<workers> error listing log files')
    }

    // If no files in list, nothing to do.
    if (list.length === 0) { return }

    // Iterate each file name.
    list.forEach((fileName) => {
      const logId = fileName.replace(/\.log$/, '')
      const newFileName = `${logId}_${new Date().toISOString()}`

      logs.compress(logId, newFileName, (compressErr) => {
        if (compressErr) {
          return debug('<workers> error compressing file:', compressErr)
        }

        logs.truncate(logId, (truncErr) => {
          if (truncErr) {
            return debug('<workers> error truncating log file: ', truncErr)
          }
        })
      })
    })
  })
}

/**
 * Examine all stored tokens and remove expired ones.
 */
const removeExpiredTokens = function removeExpiredTokens() {
  debug('<workers> removing expired tokens')

  storage.list('tokens', (listErr, tokens) => {
    if (listErr) {
      return debug('<workers>', listErr)
    }

    if (tokens.length === 0) {
      return debug('<workers> no tokens found')
    }

    tokens.forEach((name) => {
      storage.read('tokens', name, (readErr, /**@type {TokenData}*/tokenData) => {
        if (readErr || !tokenData) {
          return debug(`<workers> error reading token "${name}"`)
        }

        // Delete the token.
        deleteToken(tokenData.id)
      })
    })
  })
}

/**
 * @type {NodeJS.Timer}
 */
let loopId

/**
 * Loop expired tokens check.
 */
const loop = function loop() {
  loopId = setInterval(() => {
    removeExpiredTokens()
  }, timeMs({hours: 1}))
}

/**
 * @type {NodeJS.Timer}
 */
let rotateLoopId

const rotateLogsLoop = function rotateLogsLoop() {
  rotateLoopId = setInterval(() => {
    rotateLogs()
  }, timeMs({hours: 24}))
}

/**
 *
 */
const workers = {}

/**
 * Start the workers processes.
 */
workers.init = function init() {
  console.log('\x1b[35m%s\x1b[0m', 'Starting background workers')

  // Execute immediately.
  removeExpiredTokens()

  // Run expired token removal on an interval.
  loop()

  rotateLogs()

  rotateLogsLoop()
}

/**
 * Kill the workers processes.
 */
workers.kill = function kill() {
  if (loopId) {
    clearInterval(loopId)
  }

  if (rotateLoopId) {
    clearInterval(rotateLoopId)
  }
}

module.exports = workers
