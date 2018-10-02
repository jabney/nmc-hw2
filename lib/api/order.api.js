const api = require('../api')
const orderValidators = require('./validators/order.validators')()
const Token = require('../models/token.model')
const Cart = require('../models/cart.model')
const User = require('../models/user.model')
const StripeService = require('../services/stripe.service')
const MailgunService = require('../services/mailgun.service')

/**
 * @typedef {Token.TokenData} TokenData
 */

/**
 * @typedef {api.RequestHandler} RequestHandler
 */

 /**
  *
  * @param {Cart.SummaryItem[]} summary
  * @param {number} total
  * @param {User} user
  * @param {StripeService.CCInfo} user
  */
async function emailMessage(summary, total, user, ccinfo) {
  const message = ' '.repeat(29) + 'Thanks for your order!' + ' '.repeat(29)
  const spacer = ' '.repeat(80)

  // Create text order summary.
  const order = summary.map((item) => {
    // Create a line item for every order item.
    let lineItem = `${item.name}\n  ${item.size}\n  $${item.price.toFixed(2)}\n`

    // If the order item has sub items, add those to the line item.
    if (item.add && item.add.length) {
      // Create sub item strings.
      const subItems = item.add.map((sub) => {
        return `${sub.name}: $${sub.price.toFixed(2)}`
      })

      // Add sub item to line item.
      lineItem = `${lineItem} With: ${subItems.join(', ')}\n`
    }

    return lineItem
  })

  // Create address text
  const address = Object.values(user.address).join('\n  ')

  // Get last four of credit card.
  const cardEndingIn = ccinfo.number.toString().slice(-4)

  // Lay out message.
  const lines = [
    spacer,
    message,
    spacer,
    `Delivering to:\n\n  ${address}\n`,
    `Your order:\n`,
    '-'.repeat(80),
    ...order,
    '-'.repeat(80),
    `Total: $${total.toFixed(2)}  (card ending in ${cardEndingIn})`,
    '-'.repeat(80),
    '\n'
  ]

  // Join the lines.
  return lines.join('\n')
}

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
  orderValidators.post(requestData, async (errors, postData) => {
    if (errors && errors.length) {
      return response(400, { errors })
    }

    // Retrieve validator data.
    const { tokenId, ccinfo } = postData

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
        return response(400, { error: 'cart is empty'})
      } else {
        console.error(error)
        return response(500, { error: 'error loading resource'})
      }
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

    const user = new User(token.userId)

    try {
      // Load the user.
      await user.load()
    } catch (error) {
      return response(500, { error: 'error loading user'})
    }

    // Get the cart total.
    const total = cart.total(summary)

    // Create an instance of the stripe service.
    const stripe = new StripeService({
      number: ccinfo.number,
      exp_month: ccinfo.exp_month,
      exp_year: ccinfo.exp_year,
      cvc: ccinfo.cvc
    })

    try {
      // Charge the customer.
      await stripe.charge(total, token.userId)
    } catch (error) {
      return response(400, { message: error.message})
    }

    // Prepare email message.
    const message = await emailMessage(summary, total, user, ccinfo)

    // Create an instance of the mailgun service.
    const mailgun = new MailgunService({
      to: token.userId,
      subject: 'Your order is on its way!',
      text: message
    })

    try {
      // Send the order confirmation.
      await mailgun.send()
    } catch (error) {
      console.error(`<orders> error sending email to "${token.userId}"`, error)
    }

    return response(200, { message: 'order successful' })
  })
}

module.exports = lib
