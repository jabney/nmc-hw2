const api = require('../api')
const Validator = require('../../lib/validator')

const reEmail = /^.+?@.+?\..{2,4}$/

/**
 * @typedef {Validator.ValidationError} ValidationError
 */

/**
 * @typedef {Object} GetData
 * @property {string} email
 * @property {string} tokenId
 */

/**
 * @typedef {Object} PutData
 * @property {string} tokenId
 * @property {api.UserRecord} userRecord
 */

/**
 * @typedef {Object} DeleteData
 * @property {string} email
 * @property {string} tokenId
 */

/**
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], record?: api.UserRecord) => void} callback
 */
const post = function post(data, callback) {
  const validator = new Validator(data)

  validator
    .name('email')
    .from('payload')
    .isString({trim: true, msg: 'email must be a string'})
    .matches(reEmail, { msg: 'email must be an email address'})

  validator
    .name('firstName')
    .from('payload')
    .isString({trim: true, msg: 'firstName must be a string'})
    .isLength({min: 1, msg: 'firstName cannot be blank'})

  validator
    .name('lastName')
    .from('payload')
    .isString({trim: true, msg: 'lastName must be a string'})
    .isLength({min: 1, msg: 'lastName cannot be blank'})

  validator
    .name('password')
    .from('payload')
    .isString({trim: true, msg: 'password must be a string'})
    .isLength({min: 10, max: 128, msg: 'password must be between 10 and 128 characters'})

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    // console.error('validation errors:', errors)
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, validator.getValues())
}

/**
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], data?: GetData) => void} callback
 */
const get = function get(data, callback) {
  const validator = new Validator(data)

  const email = validator
    .name('email')
    .from('query')
    .isString({trim: true, msg: 'email must be a string'})
    .matches(reEmail, { msg: 'email must be an email address'})
    .get()

  const tokenId = validator
    .name('token')
    .from('headers')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    // console.error('validation errors:', errors)
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { email, tokenId })
}

/**
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], putData?: PutData) => void} callback
 */
const put = function put(data, callback) {
  const validator = new Validator(data)

  validator
    .name('email')
    .from('payload')
    .isString({trim: true, msg: 'email must be a string'})
    .matches(reEmail, { msg: 'email must be an email address'})

  validator
    .name('firstName')
    .from('payload')
    .optional()
    .isString({trim: true, msg: 'firstName must be a string'})
    .isLength({min: 1, msg: 'firstName cannot be blank'})

  validator
    .name('lastName')
    .from('payload')
    .optional()
    .isString({trim: true, msg: 'lastName must be a string'})
    .isLength({min: 1, msg: 'lastName cannot be blank'})

  validator
    .name('password')
    .from('payload')
    .isString({trim: true, msg: 'password must be a string'})
    .isLength({min: 10, max: 128, msg: 'password must be between 10 and 128 characters'})

  /**
   * @type {string}
   */
  const tokenId = validator
    .name('token')
    .from('headers')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    // console.error('validation errors:', errors)
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId, userRecord: validator.getValues()})
}

/**
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], data?: DeleteData) => void} callback
 */
const del = function del(data, callback) {
  const validator = new Validator(data)

  const email = validator
    .name('email')
    .from('query')
    .isString({trim: true, msg: 'email must be a string'})
    .matches(reEmail, { msg: 'email must be an email address'})
    .get()

  const tokenId = validator
    .name('token')
    .from('headers')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    // console.error('validation errors:', errors)
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { email, tokenId })
}

// Define the module factory.
const userValidator = function userValidator() {
  return { post, get, put, delete: del }
}

// Export the module factory.
module.exports = userValidator
