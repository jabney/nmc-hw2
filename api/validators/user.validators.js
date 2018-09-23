const api = require('../api')
const User = require('../../models/user.model')
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
 * @property {User.UserData} userData
 */

/**
 * @typedef {Object} DeleteData
 * @property {string} email
 * @property {string} tokenId
 */

/**
 * Validate a user's address.
 *
 * @param {User.Address} address
 * @param {Validator} validator
 */
function validateAddress(address, validator) {
  if (address) {

    validator
      .name('line1')
      .value(address.line1)
      .isString({trim: true, msg: 'address.line1 must be a string'})
      .isTruthy({msg: 'address.line1 must be non-empty string'})

    validator
      .name('line2')
      .value(address.line2)
      .optional()
      .isString({trim: true, msg: 'address.line2 must be a string'})
      .isTruthy({msg: 'address.line2 must be non-empty string'})

    validator
      .name('city')
      .value(address.city)
      .isString({trim: true, msg: 'address.city must be a string'})
      .isTruthy({msg: 'address.city must be non-empty string'})

    validator
      .name('state')
      .value(address.state)
      .isString({trim: true, msg: 'address.state must be a string'})
      .isTruthy({msg: 'address.state must be non-empty string'})
      .matches(/[a-z]{2}/i, {msg: 'address.state must be a valid state abbreviation'})

    validator
      .name('zip')
      .value(address.zip)
      .isString({trim: true, msg: 'address.zip must be a string'})
      .matches(/^\d{5}(?:-\d{4})?$/, {msg: 'address.zip must be proper zip code format'})
  }
}

/**
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], record?: User.UserData) => void} callback
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

  const address = validator
    .name('address')
    .from('payload')
    .isObject({msg: 'address must be an object'})
    .get()

  validateAddress(address, validator)

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

  const tokenId = validator
    .name('token')
    .from('headers')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  const address = validator
    .name('address')
    .from('payload')
    .optional()
    .isObject({msg: 'address must be an object'})
    .get()

  validateAddress(address, validator)

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    // console.error('validation errors:', errors)
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId, userData: validator.getValues()})
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
