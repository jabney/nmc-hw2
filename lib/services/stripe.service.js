const https = require('https')
const http = require('http')
const querystring = require('querystring')

const config = require('../../config')

/**
 * Thrown when a stripe payment error occurs.
 */
class PaymentError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

/**
 * Passed to the StripeService constructor.
 *
 * @typedef {Object} CCInfo
 * @property {number} number
 * @property {number} exp_month
 * @property {number} exp_year
 * @property {number} cvc
 */

/**
 * Passed to the stripe api.
 *
 * @typedef {Object} PaymentInfo
 * @property {number} amount
 * @property {string} currency
 * @property {string} source
 * @property {string} description
 */

/**
 * Returned from the stripe api.
 *
 * @typedef {Object} TokenResponse
 * @property {string} id
 */

/**
 * Returned from the stripe api.
 *
 * @typedef {Object} PaymentSuccess
 * @property {string} id
 */

/**
 * Returned from the stripe api.
 *
 * @typedef {Object} CardFailure
 * @property {never} id
 * @property {string} code
 * @property {string} message
 */

/**
 * Returned from the makeRequest function.
 *
 * @typedef {Object} ResponseData
 * @property {number} code
 * @property {any} body
 * @property {http.IncomingHttpHeaders} headers
 */

/**
 * Get the response body from a response object.
 *
 * @param {http.IncomingMessage} res
 */
function getResponseBody(res) {
  return new Promise((resolve, reject) => {
    const buffer = []

    res.on('data', (data) => {
      buffer.push(data.toString())
    })

    res.on('end', () => {
      resolve(buffer.join(''))
    })

    res.on('error', (error) => {
      reject(error)
    })
  })
}

/**
 * Make an https request.
 *
 * @param {http.RequestOptions} options
 * @param {any} payload
 *
 * @returns {Promise<ResponseData>}
 */
const makeRequest = function makeRequest(options, payload) {
  return new Promise((resolve, reject) => {

    // Initiate the request.
    const request = https.request(options, async (res) => {
      const body = await getResponseBody(res)
      const headers = res.headers
      const code = res.statusCode
      resolve({ code, body, headers})
    })

    // Handle errors.
    request.on('error', (error) => reject(error))

    // Write request payload.
    request.write(payload)

    // End the request.
    request.end()
  })
}

/**
 * Create a request options object for tokens.
 *
 * @param {string} payload
 *
 * @returns {https.RequestOptions}
 */
function tokenOptions(payload) {
  const options = {
    protocol: 'https:',
    hostname: 'api.stripe.com',
    method: 'POST',
    path: `/v1/tokens`,
    auth: `${config.stripe.key}:`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(payload),
    }
  }

  return options
}

/**
 * Create a request options object for tokens.
 *
 * @param {string} payload
 *
 * @returns {https.RequestOptions}
 */
function chargeOptions(payload) {
  const options = {
    protocol: 'https:',
    hostname: 'api.stripe.com',
    method: 'POST',
    path: `/v1/charges`,
    auth: `${config.stripe.key}:`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(payload),
    }
  }

  return options
}

/**
 * Build a query string from ccinfo data.
 * (card[number]=4242...&card[exp_month]=12&card[exp_year]=2019&...)
 *
 * @param {CCInfo} ccinfo
 */
function cardQueryString(ccinfo) {
  // Get the key/val entries of the ccinfo.
  const entries = Object.entries(ccinfo)

  // Generate a list of key/val pair strings ('card[key]=val').
  const keyVals = entries.reduce((list, pair) => {
    const [key, value] = pair
    return list.push(`card[${key}]=${value}`) && list
  }, [])

  // Join the list with the necessary delimiter.
  return keyVals.join('&')
}

class StripeService {
  /**
   * @param {CCInfo} ccinfo
   */
  constructor(ccinfo) {
    this.ccinfo = ccinfo
  }

  /**
   * Charge the card.
   *
   * @param {number} amount
   * @param {string} userEmail
   *
   * @returns {Promise<PaymentSuccess>}
   */
  async charge(amount, userEmail) {
    // Get a card token from stripe.
    const tokenResult = await this._cardToken()

    // Charge the card.
    const chargeResult = await this._charge(amount, userEmail, tokenResult.id)

    return chargeResult
  }

  /**
   * Retrieve a card token from stripe.
   *
   * @returns {Promise<any>}
   */
  async _cardToken() {
    // Query-stringify ccinfo as the payload.
    const payload = cardQueryString(this.ccinfo)

    // Get token request options
    const options = tokenOptions(payload)

    // Get the resonse data.
    const response = await makeRequest(options, payload)

    // Parse json response.
    const responseObj = JSON.parse(response.body)

    if (response.code >= 400) {
      /**
       * @type {CardFailure}
       */
      const error = responseObj.error

      throw new PaymentError(error.message, error.code)
    }

    return responseObj
  }

  /**
   *
   * @param {number} amount
   * @param {string} email
   * @param {string} tokenId
   */
  async _charge(amount, email, tokenId) {

    /**
     * Build a payment info object.
     *
     * @type {PaymentInfo}
     */
    const paymentInfo = {
      amount: amount * 100,
      currency: 'usd',
      source: tokenId,
      description: `Charge for ${email}`
    }

    // Query-stringify ccinfo as the payload.
    const payload = querystring.stringify(paymentInfo)

    // Get token request options
    const options = chargeOptions(payload)

    // Get the resonse data.
    const response = await makeRequest(options, payload)

    // Parse json response.
    const responseObj = JSON.parse(response.body)

    if (response.code >= 400) {
      /**
       * @type {CardFailure}
       */
      const error = responseObj.error

      throw new PaymentError(error.message, error.code)
    }

    return responseObj
  }
}

if (config.name !== 'production') {
  /**
   * Stripe test numbers.
   */
  StripeService.testNumbers = {
    success: 4242424242424242,
    generic_decline: 4000000000000002,
    insufficient_funds: 4000000000009995,
    lost_card: 4000000000009987,
    stolen_card: 4000000000009979,
    expired_card: 4000000000000069,
    incorrect_cvc: 4000000000000127,
    processing_error: 4000000000000119,
    incorrect_number: 4242424242424241,
  }
}

// const ss = new StripeService({
//   // number: StripeService.testNumbers.incorrect_number,
//   // number: StripeService.testNumbers.expired_card,
//   number: StripeService.testNumbers.success,
//   exp_month: 12,
//   exp_year: 2019,
//   cvc: 123
// })

// ss.charge(15.99, 'jimmy@jimmy.com')
//   .then(data => console.log('charge data:', data))
//   .catch(error => console.error(error))

module.exports = StripeService
