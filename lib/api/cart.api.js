const util = require('util')
const api = require('../api')
const cartValidators = require('./validators/cart.validators')()
const Token = require('../models/token.model')
const User = require('../models/user.model')
const Cart = require('../models/cart.model')

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
  cartValidators.post(requestData, async (errors, postData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Retrieve validator data.
    const { tokenId, items } = postData

    // Create a token.
    const token = new Token(tokenId)

    try {
      // Try to load the token.
      await token.load()

    } catch (error) {
      // If there is no token, this request is not authorized.
      if (error.code === 'ENOENT') {
        return response(403, { error: 'not authorized'})
      }

      return response(500, { error: 'unknown token error'})
    }

    // Verify the token.
    if (!token.verify()) {
      return response(403, { error: 'not authorized'})
    }

    // Create a new cart document.
    const cart = new Cart(token.userId)

    try {
      // Try to load the cart.
      await cart.load()
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Cart doesn't exist. We can ignore this error.
      } else {
        console.error(error)
        return response(500, { error: 'error loading resource'})
      }
    }

    try {
      // We have a cart now, either a new one or an existing one.
      items.forEach((item) => cart.addItem(item))
    } catch (error) {
      return response(500, { error: 'error adding cart item'})
    }

    try {
      // Save the cart.
      await cart.save()
    } catch (error) {
      return response(500, { error: 'error saving cart'})
    }

    /**
     * @type {Cart.SummaryItem[]}
     */
    let summary

    try {
      // Summarize the cart.
      summary = await cart.summarize()
    } catch (error) {
      return response(500, { error: 'error processing cart'})
    }

    const responsePayload = {
      total: cart.total(summary),
      items: summary
    }

    return response(200, { cart: responsePayload })
  })
}

/**
 * Tokens get handler
 *
 * @type {RequestHandler}
 */
lib.get = (requestData, response) => {
  // Validate incoming request data.
  cartValidators.get(requestData, async (errors, getData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Retrieve validator data.
    const { tokenId } = getData

    // Create a token.
    const token = new Token(tokenId)

    try {
      // Try to load the token.
      await token.load()

    } catch (error) {
      // If there is no token, this request is not authorized.
      if (error.code === 'ENOENT') {
        return response(403, { error: 'not authorized'})
      }

      return response(500, { error: 'unknown token error'})
    }

    // Verify the token.
    if (!token.verify()) {
      return response(403, { error: 'not authorized'})
    }

    // Create a new cart document.
    const cart = new Cart(token.userId)

    try {
      // Try to load the cart.
      await cart.load()
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Cart doesn't exist. We can ignore this error.
      } else {
        console.error(error)
        return response(500, { error: 'error loading resource'})
      }
    }

    /**
     * @type {Cart.SummaryItem[]}
     */
    let summary

    try {
      // Summarize the cart.
      summary = await cart.summarize()
    } catch (error) {
      return response(500, { error: 'error processing cart'})
    }

    const responsePayload = {
      total: cart.total(summary),
      items: summary
    }

    return response(200, { cart: responsePayload })
  })
}

/**
 * Delete a token.
 *
 * @type {RequestHandler}
 */
lib.delete = (requestData, response) => {
  // Validate incoming request data.
  cartValidators.delete(requestData, async (errors, deleteData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Retrieve validator data.
    const { tokenId, id } = deleteData

    // Create a token.
    const token = new Token(tokenId)

    try {
      // Try to load the token.
      await token.load()

    } catch (error) {
      // If there is no token, this request is not authorized.
      if (error.code === 'ENOENT') {
        return response(403, { error: 'not authorized'})
      }

      return response(500, { error: 'unknown token error'})
    }

    // Verify the token.
    if (!token.verify()) {
      return response(403, { error: 'not authorized'})
    }

    // Create a new cart document.
    const cart = new Cart(token.userId)

    try {
      // Try to load the cart.
      await cart.load()
    } catch (error) {
      if (error.code === 'ENOENT') {
        return response(400, { error: 'no items in cart'})
      } else {
        console.error(error)
        return response(500, { error: 'error loading resource'})
      }
    }

    if (id == null) {
      // Clear the cart of its contents.
      cart.clear()
    } else {
      // Remove the given item from the cart.
      cart.removeItem(id)
    }

    try {
      // Save the cart.
      await cart.save()
    } catch (error) {
      return response(500, { error: 'error saving cart'})
    }

    /**
     * @type {Cart.SummaryItem[]}
     */
    let summary

    try {
      // Summarize the cart.
      summary = await cart.summarize()
    } catch (error) {
      return response(500, { error: 'error processing cart'})
    }

    const responsePayload = {
      total: cart.total(summary),
      items: summary
    }

    return response(200, { cart: responsePayload })
  })
}

module.exports = lib
