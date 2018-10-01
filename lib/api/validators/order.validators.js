const api = require('../../api')
const Validator = require('../../validator')
const StripeService = require('../../services/stripe.service')

/**
 * @typedef {Validator.ValidationError} ValidationError
 */

/**
 * @typedef {Object} PostData
 * @property {string} tokenId
 * @property {StripeService.CCInfo} ccinfo
 */

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
   * @type {StripeService.CCInfo}
   */
  const ccinfo = validator
    .name('ccinfo')
    .from('payload')
    .isObject()
    .get()

  validator
    .name('number')
    .value(ccinfo.number)
    .isNumber({ msg: 'ccinfo.number must be a number'})

  validator
    .name('exp_month')
    .value(ccinfo.exp_month)
    .isNumber({ msg: 'ccinfo.exp_month must be a number'})
    .isInRange({ min: 1, max: 12,  msg: 'ccinfo.exp_month must be a valid month'})

  validator
    .name('exp_year')
    .value(ccinfo.exp_year)
    .isNumber({ msg: 'ccinfo.exp_year must be a number'})
    .isInRange({ min: 2018, max: 2030,  msg: 'ccinfo.exp_year must be a valid year'})

  validator
    .name('cvc')
    .value(ccinfo.cvc)
    .isNumber({ msg: 'ccinfo.cvc must be a number'})
    .isInRange({ min: 1, max: 999,  msg: 'ccinfo.cvc must be a valid cvc'})

  // Get any validation errors.
  const errors = validator.errors()

  if (errors.length > 0) {
    return callback(errors)
  }

  // Validation passed. Return the user record.
  callback(null, { tokenId, ccinfo })
}

// Define the module factory.
const cartValidator = function cartValidator() {
  return { post }
}

// Export the module factory.
module.exports = cartValidator
