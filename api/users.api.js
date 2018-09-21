const api = require('./api')
const userValidators = require('./validators/user.validators')()
const User = require('../models/user.model')
const Token = require('../models/token.model')

/**
 * @typedef {api.UserRecord} UserRecord
 */

/**
 * @typedef {api.RequestHandler} RequestHandler
 */

/**
 * Create the users handlers container.
 *
 * @type {api.ApiLib}
 */
const lib = {}

// const baseDir = dataApi.baseDir + '/.users'

/**
 * Users post handler
 *
 * @type {RequestHandler}
 */
lib.post = async (requestData, response) => {
  // Validate incoming request data.
  userValidators.post(requestData, async (errors, userRecord) => {
    // Check for validation errors.
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Initialize the user model.
    const user = new User(userRecord.email)

    try {
      // Check if the user exists (try and load user from disk).
      await user.load()
      return response(400, { error: 'user already exists' })

    } catch (error) {
      // An error means the user does not exist. Continue.
    }

    try {
      // Load user data into the model from the user record.
      user.deserialize(userRecord, true)

      // Save the user and respond.
      await user.save()
      const responseData = user.serialize()
      delete responseData.password
      return response(200, { user: responseData })

    } catch (error) {
      // User save error.
      return response(500, { error })
    }
  })
}

/**
 * Users get handler
 *
 * @type {RequestHandler}
 */
lib.get = (requestData, response) => {
  // Vaidate incoming request data.
  userValidators.get(requestData, async (errors, validationData) => {
    // Check for validation errors.
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Get the validator data.
    const { email, tokenId } = validationData

    // Verify the token.
    const verified = await Token.verify(tokenId)
    if (verified !== true) {
      return response(403, { error: 'not authorized' })
    }

    // Create a user model.
    const user = new User(email)

    try {
      // Try to load the user.
      await user.load()
      // Get the user data to respond with.
      const responseData = user.serialize()
      delete responseData.password
      // Return the response.
      return response(200, { user: responseData })
    } catch (error) {
      // Could not load the user.
      return response(404, { error: 'user not found' })
    }
  })
}

/**
 * Users put handler
 *
 * @type {RequestHandler}
 */
lib.put = (requestData, response) => {
  userValidators.put(requestData, async (errors, putData) => {
    // Check for validation errors.
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Get variables from validator.
    const { tokenId, userRecord } = putData

    // Verify the token.
    const verified = await Token.verify(tokenId)
    if (verified !== true) {
      return response(403, { error: 'not authorized' })
    }

    // Check that the user record has one or more keys.
    if (Object.keys(userRecord).length === 0) {
      return response(400, { error: 'no update fields specified' })
    }

    // Create a user model.
    const user = new User(userRecord.email)

    try {
      // Load the user.
      await user.load()
    } catch (error) {
      return response(400, { error: 'user not found' })
    }

    try {
      // Update the user.
      user.deserialize(userRecord, true)
      await user.save()
      delete userRecord.password
      return response(200, { user: userRecord })
    } catch (error) {
      return response(500, { error: 'error updating user'})
    }
  })
}

/**
 * Users delete handler
 *
 * @type {RequestHandler}
 */
lib.delete = (requestData, response) => {
  // Vaidate incoming request data.
  userValidators.get(requestData, async (errors, validationData) => {
    // Check for validation errors.
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Get the validator data.
    const { email, tokenId } = validationData

    // Verify the token.
    const verified = await Token.verify(tokenId)
    if (verified !== true) {
      return response(403, { error: 'not authorized' })
    }

    // Create a user model.
    const user = new User(email)

    try {
      // Try to load the user.
      await user.load()
    } catch (error) {
      // Could not load the user.
      return response(400, { error: 'user not found' })
    }

    try {
      await Token.delete(tokenId)
    } catch (error) {
      return response(500, { error: 'error deleting token'})
    }

    try {
      await user.delete()
      return response(200, { message: 'user deleted successfully'})
    } catch (error) {
      return response(500, { error: 'error deleting user' })
    }
  })
}

module.exports = lib
