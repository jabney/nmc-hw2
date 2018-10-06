const api = require('../../api')
const Validator = require('../../validator')
const Cart = require('../../models/cart.model')
const menu = require('../../menu')

const itemSizes = menu.sizes

/**
 * @typedef {Validator.ValidationError} ValidationError
 */

/**
 * @typedef {Object} PostData
 * @property {string} tokenId
 * @property {Cart.CartItem[]} items
 */

/**
 * @typedef {Object} GetData
 * @property {string} tokenId
 */

/**
 * @typedef {Object} PutData
 * @property {string} tokenId
 * @property {boolean} extend
 */

/**
 * @typedef {Object} DeleteData
 * @property {string} tokenId
 * @property {string} id
 */

/**
 * Validate cart items.
 *
 * @param {Cart.CartItem[]} items
 */
const validateCartItems = function validateCartItems(items, depth=0) {
  const validator = new Validator()

  /**
   * Create an errors buffer for recursive error gathering.
   *
   * @type {Validator.ValidationError[]}
   */
  let errors = []

  if (items) {
    // Check the depth of recursion. Add items cannot have add items.
    validator
      .name('depth')
      .value(depth)
      // Only allow 1 level of nesting for add items.
      .isInRange({min: 0, max: 1, msg: 'add items cannot have add items'})

    // Check that each item is proper.
    items.forEach((item) => {
      validator
        .name('item.id')
        .value(item.id)
        .isString()

      // Only check size of first-level items. Sub-items inherit
      // their size from their parent.
      if (depth === 0) {
        validator
          .name('item.size')
          .value(item.size)
          .isString()
          .isIn(itemSizes)
      }

      validator
        .name('item.add')
        .value(item.add)
        .optional()
        .isArray()

        // Add errors from recursive validation call.
        errors.push.apply(errors, validateCartItems(item.add, depth + 1))
      })
    }

  // Return this validator's errors as well as recursion errors.
  return [...errors, ...validator.errors()]
}

/**
 * Validator for adding items to a cart.
 *
 * @param {api.RequestData} requestData
 * @param {(errors: ValidationError[], postData?: PostData) => void} callback
 */
const post = function post(requestData, callback) {
  const validator = new Validator(requestData)

  const tokenId = validator
    .name('token')
    .from('headers')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  /**
   * @type {Cart.CartItem[]}
   */
  const items = validator
    .name('items')
    .from('payload')
    .isArray({msg: 'must include an items array' })
    .isLength({min: 1, msg: 'items cannot be empty' })
    .get()

  // Get any validation errors.
  const errors = [...validator.errors(), ...validateCartItems(items)]

  if (errors.length > 0) {
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId, items })
}

/**
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], data?: GetData) => void} callback
 */
const get = function get(data, callback) {
  const validator = new Validator(data)

  const tokenId = validator
    .name('token')
    .from('headers')
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
 * @param {api.RequestData} data
 * @param {(errors: ValidationError[], data?: DeleteData) => void} callback
 */
const del = function del(data, callback) {
  const validator = new Validator(data)

  const tokenId = validator
    .name('token')
    .from('headers')
    .isString({trim: true, msg: 'token must be a string'})
    .isLength({min: 32, max: 32, msg: 'invalid token format'})
    .get()

  const id = validator
    .name('id')
    .from('query')
    .optional()
    .isString()
    .get()

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId, id })
}

// Define the module factory.
const cartValidator = function cartValidator() {
  return { post, get, delete: del }
}

// Export the module factory.
module.exports = cartValidator
