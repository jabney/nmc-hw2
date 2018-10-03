const api = require('../api')
const userValidators = require('./validators/user.validators')()
const User = require('../models/user.model')
const Token = require('../models/token.model')
const Cart = require('../models/cart.model')

/**
 * @typedef {User.UserData} UserData
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
 * Change a user's email. Do this in an order that's least likely
 * to leave the user in an undefined state should a step fail.
 *
 * @param {string} newEmail
 * @param {Token} token
 */
const changeEmail = async function changeEmail(newEmail, token) {
  // Create items under existing email address.
  const existingUser = new User(token.userId)
  const existingCart = new Cart(token.userId)

  // Load existing items.
  await existingUser.load()
  await existingCart.load()

  // Create new items from the old ones.
  const newUser = new User().deserialize(existingUser.serialize())
  const newCart = new Cart().deserialize(existingCart.serialize())

  // Save the new items.
  await newUser.save(newEmail)
  await newCart.save(newEmail)

  // Update the token
  token.userId = newEmail
  await token.save()

  await existingCart.delete()
  await existingUser.delete()

  return newEmail
}

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
      // Create a cart for the user.
      new Cart(userRecord.email).save()
    } catch (error) {
      console.error('<users.api> error creating cart:', error)
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
    if (errors && errors.length > 0) {
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
    const { tokenId, userData } = putData

    // Don't update email address if given.
    // delete userData.email

    // Create a token document.
    const token = new Token(tokenId)

    try {
      // Try to load the token.
      await token.load()

      // Verify the token.
      const verified =  token.verify()
      if (verified !== true) {
        return response(403, { error: 'not authorized' })
      }
    } catch (error) {
      /**
       * A failure is most likely a read error caused by
       * the token not being found.
       */
      return response(403, { error: 'not authorized' })
    }

    // Check that the user record has one or more keys.
    if (Object.keys(userData).length === 0) {
      return response(400, { error: 'no update fields specified' })
    }

    // Create a user model.
    const user = new User(token.userId)

    try {
      // Load the user.
      await user.load()
    } catch (error) {
      return response(400, { error: 'user not found' })
    }

    if (userData.email) {
      try {
        // We need to update the user, token, and cart.
        user.id = await changeEmail(userData.email, token)
      } catch (error) {
        console.error('<users.api> error changing email:', error)
      }
    }

    try {
      // Update the user.
      user.deserialize(userData, true)
      await user.save()
      delete userData.password

      return response(200, { user: userData })
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
      // Try to delete the user's cart, which may or may not exist.
      const cart = new Cart(email)
      await cart.delete()
    } catch (error) {
      // Cart probably doesn't exist.
    }

    try {
      await new Token(tokenId).delete()
    } catch (error) {
      console.error('<users.api> error deleting token:', error)
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
