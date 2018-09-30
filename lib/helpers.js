const crypto = require('crypto')

const config = require('../config')

/**
 * @typedef {Object} HelpersLib
 * @property {(str: string) => string} hash
 * @property {(length: number) => string} createRandomString
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
 *
 * @param {number} length
 */
helpers.createRandomString = function createRandomString(length) {
  // Require length of at least one.
  if (length <= 0) {
    throw new Error('length must be positive and non-zero')
  }

  // Generate a list of random characters.
  const randChars = new Array(length).fill(0).map((x) => {
    const num = crypto.randomBytes(4).readUInt32LE(0)
    return charset.charAt(num % charset.length)
  })

  // Return the joined characters.
  return randChars.join('')
}

module.exports = helpers
