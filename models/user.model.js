const helpers = require('../lib/helpers')
const Model = require('./model')

/**
 * @typedef {Object} Address
 * @property {string} line1
 * @property {string} [line2]
 * @property {string} city
 * @property {string} state
 * @property {string} zip
 */

/**
 * @typedef {Object} UserData
 * @property {string} email
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {Address} [address]
 * @property {string} [password]
 */

class User extends Model {
  /**
   * @param {string} [id]
   */
  constructor(id) {
    super('users', id)

    /**
     * @type {string}
     */
    this.email = null

    /**
     * @type {string}
     */
    this.firstName = null

    /**
     * @type {string}
     */
    this.lastName = null

    /**
     * @type {Address}
     */
    this.address = null

    /**
     * @type {string}
     */
    this._password = null
  }

  /**
   * Return the password.
   */
  get password() {
    return this._password
  }

  /**
   * Hash and set the password.
   */
  set password(pass) {
    this._password = helpers.hash(pass)
  }

  /**
   * Return members of this model as elements of an object.
   *
   * @returns {UserData}
   */
  serialize() {
    /**
     * @type {UserData}
     */
    const serializedUser = {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      address: this.address,
      password: this.password,
    }

    return serializedUser
  }

  /**
   * Extend this token by the given ms.
   *
   * @param {UserData} data
   * @param {boolean} [hashPassword]
   */
  deserialize(data, hashPassword) {

    this.email = typeof data.email !== 'undefined' ? data.email : this.email
    this.firstName = typeof data.firstName !== 'undefined' ? data.firstName : this.firstName
    this.lastName = typeof data.lastName !== 'undefined' ? data.lastName : this.lastName
    this.address = typeof data.address !== 'undefined' ? data.address : this.address

    if (typeof data.password !== 'undefined') {
      if (hashPassword) {
        // Assign through setter so it will be hashed.
        this.password = data.password
      } else {
        // Bypass setter.
        this._password = data.password
      }
    }
  }

  /**
   * Verify that the given password matches the stored password.
   *
   * @param {string} password
   */
  verifyPassword(password) {
    if (typeof password === 'undefined' || this._password === 'undefined') {
      return false
    }

    // Hash the given password and compare with stored password.
    return helpers.hash(password) === this._password
  }
}

module.exports = User
