const crypto = require('crypto')

const config = require('../config')

/**
 * @typedef {Object} HelpersLib
 * @property {(str: string) => string} hash
 * @property {(str: string) => Object} parseJson
 * @property {(length: number) => string} createRandomString
 * @property {(str: string) => any} parseAsJson
 */

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

 /**
  * @type HelpersLib
  */
const helpers = {}

/**
 * Hash a password with hmac/sha256.
 *
 * @param {string} str
 */
helpers.hash = function hash(str) {
  if (typeof str === 'string' && str.length) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex')
    return hash
  } else {
    return null
  }
}

/**
 * Parse a string as json. On failure, return empty object.
 *
 * @param {string} str
 */
helpers.parseJson = function parseJson(str) {
  try {
    return JSON.parse(str)
  } catch (error) {
    return {}
  }
}

/**
 *
 * @param {number} length
 */
helpers.createRandomString = function createRandomString(length) {
  // Require length of at least one.
  if (length === 0) {
    return null
  }

  // Generate a list of random characters.
  const randChars = new Array(length).fill(0).map((x) => {
    const num = crypto.randomBytes(4).readUInt32LE(0)
    return charset.charAt(num % charset.length)
  })

  // Return the joined characters.
  return randChars.join('')
}


/**
 * Parse the given string as json.
 *
 * @param {string} str
 */
helpers.parseAsJson = function parseAsJson(str) {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.warn('could not parse json, returning an empty object')
    // If parsing fails, just return an empty object.
    return {}
  }
}

module.exports = helpers
