const config = require('../config')
const api = require('../api/api')
const tokenValidators = require('./validators/token.validators')()
const Token = require('../models/token.model')
const User = require('../models/user.model')

/**
 * @typedef {Token.TokenData} TokenData
 */
/**
 * @typedef {User.UserData} UserData
 */
/**
 * @typedef {api.RequestHandler} RequestHandler
 */

/**
 * Create the token handlers container.
 *
 * @type {api.ApiLib}
 */
const lib = {}

/**
 * Create a token for a given user.
 *
 * @type {RequestHandler}
 */
lib.post = (requestData, response) => {
  // Validate incoming request data.
  tokenValidators.post(requestData, async (errors, postData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Get the validator data.
    const { email, password } = postData

    // Use a common message for authorization failures.
    // This prevents leaking user validation failure information.
    const commonFailureMessage = 'authorization failure'

    // Create a new user.
    const user = new User(email)

    try {
      // Try to load the user.
      await user.load()
    } catch (error) {
      // Could not load user (not found).
      return response(400, { error: commonFailureMessage })
    }

    // Verify the password.
    const verified = user.verifyPassword(password)
    if (verified !== true) {
      return response(400, { error: commonFailureMessage })
    }

    try {
      // Create the token and respond.
      const token = await Token.create(email, config.authTokenExpMs)
      return response(200, { token: token.serialize() })
    } catch (error) {
      // Unknown error.
      return response(500, { error: 'token creation error' })
    }
  })
}

/**
 * Tokens get handler
 *
 * @type {RequestHandler}
 */
lib.get = (requestData, response) => {
  // Validate incoming request data.
  tokenValidators.get(requestData, async (errors, getData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Get token id from validator data.
    const { tokenId } = getData

    // Create a token model.
    const token = new Token(tokenId)

    try {
      // Load the token and respond.
      await token.load()
      return response(200, { token: token.serialize() })
    } catch (error) {
      return response(400, { error: 'token not found'})
    }
  })
}

/**
 * Extend a token.
 *
 * @type {RequestHandler}
 */
lib.put = (requestData, response) => {
  // Validate incoming request data.
  tokenValidators.put(requestData, async (errors, putData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Get the validator data.
    const { tokenId, extend } = putData

    // Create a token model.
    const token = new Token(tokenId)

    try {
      // Try to load the token.
      await token.load()
    } catch (error) {
      return response(400, { error: 'token not found'})
    }

    // Verify the token.
    if (!token.verify()) {
      return response(400, { error: 'token is expired' })
    }

    try {
      // Extend the token by twenty-four hours.
      token.extend(config.authTokenExpMs)
      token.save()
      return response(200, { message: 'token extended' })
    } catch (error) {
      return response(500, { error: 'error extending token'})
    }
  })
}

/**
 * Delete a token.
 *
 * @type {RequestHandler}
 */
lib.delete = (requestData, response) => {
  // Validate incoming request data.
  tokenValidators.delete(requestData, async (errors, deleteData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Get tokenId from validator.
    const { tokenId } = deleteData

    try {
      // Delete the token and respond.
      await Token.delete(tokenId)
      return response(200, { message: 'token deleted' })
    } catch (error) {
      return response(500, { error: 'error deleting token' })
    }
  })
}

module.exports = lib
