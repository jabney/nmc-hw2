const helpers = require('../lib/helpers')
const Model = require('./model')

/**
 * @typedef {Object} UserRecord
 * @property {string} email
 * @property {string} [firstName]
 * @property {string} [lastName]
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
   * @returns {UserRecord}
   */
  serialize() {
    /**
     * @type {UserRecord}
     */
    const serializedUser = {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
    }

    return serializedUser
  }

  /**
   * Extend this token by the given ms.
   *
   * @param {UserRecord} data
   * @param {boolean} [hashPassword]
   */
  deserialize(data, hashPassword) {

    this.email = typeof data.email !== 'undefined' ? data.email : this.email
    this.firstName = typeof data.firstName !== 'undefined' ? data.firstName : this.firstName
    this.lastName = typeof data.lastName !== 'undefined' ? data.lastName : this.lastName

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
