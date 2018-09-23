const helpers = require('../lib/helpers')
const Model = require('./model')

/**
 * @typedef {Object} TokenData
 * @property {string} id
 * @property {string} userId
 * @property {number} expires
 */

class Token extends Model {
  /**
   * @param {string} [id]
   */
  constructor(id) {
    super('tokens', id)

    /**
     * @type {string}
     */
    this.id = null

    /**
     * @type {string}
     */
    this.userId = null

    /**
     * @type {number} Epoch Time
     */
    this.expires = null
  }

  /**
   * Return members of this model as elements of an object.
   *
   * @returns {TokenData}
   */
  serialize() {
    const serializedToken = {
      id: this.id,
      userId: this.userId,
      expires: this.expires,
    }

    return serializedToken
  }

  /**
   * Assign elements from given data to members of this model.
   *
   * @param {TokenData} data
   *
   * @returns {Token}
   */
  deserialize(data) {
    this.id = typeof data.id === 'undefined' && this.id || data.id
    this.userId = typeof data.userId === 'undefined' && this.userId || data.userId
    this.expires = typeof data.expires === 'undefined' && this.expires || data.expires
    return this
  }

  /**
   * Extend this token by the given ms.
   *
   * @param {number} ms The number of milliseconds to extend the token.
   *
   * @returns {Token}
   */
  extend(ms) {
    this.expires = Date.now() + ms
    return this
  }

  /**
   * Verify that a token is valid -- that it exists and is not expired.
   */
  verify() {
    if (typeof this.id === 'undefined') {
      return false
    }

    return this.expires > Date.now()
  }
}

/**
 * Verify that a token is valid -- that it exists and is not expired.
 *
 * @param {string} tokenId
 */
Token.verify = async function verify(tokenId) {
  try {
    const token = new Token(tokenId)
    await token.load()
    return token.verify()
  } catch (error) {
    return false
  }
}

/**
 * Create a new token.
 *
 * @param {string} userId
 * @param {number} validForMs
 */
Token.create = async function create(userId, validForMs) {
  const id = helpers.createRandomString(32)
  const token = new Token(id)
  const data = { id, userId, expires: Date.now() + validForMs }
  token.deserialize(data)
  await token.save()
  return token
}

/**
 * Delete a token.
 *
 * @param {string} tokenId
 */
Token.delete = async function del(tokenId) {
  await new Token(tokenId).delete()
}

module.exports = Token
