const api = require('../../api')
const Validator = require('../../validator')

/**
 * @typedef {Validator.ValidationError} ValidationError
 */

/**
 * @typedef {Object} GetData
 * @property {string} tokenId
 */

/**
 * @typedef {Object} PostData
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} PutData
 * @property {string} tokenId
 * @property {boolean} extend
 */

/**
 * @typedef {Object} DeleteData
 * @property {string} tokenId
 */

/**
 * @param {api.RequestData} requestData
 * @param {(errors: ValidationError[], postData?: PostData) => void} callback
 */
const post = function post(requestData, callback) {
  const validator = new Validator(requestData)

  // Validate email.
  validator
    .name('email')
    .from('payload')
    .isString({trim: true, msg: 'token must be a string' })

  // Validate password
  validator
    .name('password')
    .from('payload')
    .isString({trim: true, msg: 'password must be a string' })

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
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

  const tokenId = validator
    .name('token')
    .from('query')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId })
}

/**
 * @param {api.RequestData} requestData
 * @param {(errors: ValidationError[], postData?: PutData) => void} callback
 */
const put = function put(requestData, callback) {
  const validator = new Validator(requestData)

  // Validate email.
  const tokenId = validator
    .name('token')
    .from('payload')
    .isString({trim: true, msg: 'token must be a string'})
    .get()

  // Validate password
  const extend = validator
    .name('extend')
    .from('payload')
    .isBoolean({ msg: 'extend must be a boolean' })
    .isTrue()
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId, extend })
}

/**
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], data?: DeleteData) => void} callback
 */
const del = function del(data, callback) {
  const validator = new Validator(data)

  const tokenId = validator
    .name('token')
    .from('query')
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    // console.error('validation errors:', errors)
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId })
}

// Define the module factory.
const userValidator = function userValidator() {
  return { post, get, put, delete: del }
}

// Export the module factory.
module.exports = userValidator
