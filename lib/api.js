/**
 * API module - defines APIs for handling requests.
 */
const userHandlers = require('./api/users.api')
const tokenHandlers = require('./api/tokens.api')
const menuHandlers = require('./api/menu.api')
const cartHandlers = require('./api/cart.api')
const orderHandlers = require('./api/order.api')

/**
 * @typedef {Object} RequestData
 * @property {{[key: string]: string|string[]}} query
 * @property {string} method
 * @property {{[key: string]: string}} headers
 * @property {string} path
 * @property {Object} payload
 */

/**
 * @typedef {(code: number, payload?: Object) => void} HandlerResponse
 */

/**
 * @typedef {(data: RequestData, response: HandlerResponse) => void} RequestHandler
 */

/**
 * @typedef {{[key: string]: RequestHandler}} ApiLib
 */

/**
 * Return a handler that will forward requests to an api library.
 *
 * @param {ApiLib} apiLib
 * @param {string[]} allowedMethods
 *
 * @return {RequestHandler}
 */
function createLibHandler(apiLib, allowedMethods) {
  /**
   * @type {RequestHandler}
   */
  return (data, response) => {
    // Get the request method from the request data.
    const method = data.method

    // Check if method is not in the allowed list.
    if (!allowedMethods.includes(method)) {
      return response(405, { error: 'method not allowed' })
    }

    // Fall back to not found handler if method handler not found.
    const handler = apiLib[method] || handlers.notFound
    handler(data, response)
  }
}

/**
 * Create route handlers container.
 *
 * @type {{[key: string]: RequestHandler}}
 */
const handlers = {}

// Create user handlers.
handlers.users = createLibHandler(userHandlers, ['post', 'get', 'patch', 'delete'])

// Create token handlers.
handlers.tokens = createLibHandler(tokenHandlers, ['post', 'get', 'put', 'delete'])

// Create menu handlers.
handlers.menu = createLibHandler(menuHandlers, ['get'])

// Create cart handlers.
handlers.cart = createLibHandler(cartHandlers, ['post', 'get', 'delete'])

// Create order handlers.
handlers.order = createLibHandler(orderHandlers, ['post'])

/**
 * Ping route handler.
 *
 * @type {RequestHandler}
 */
handlers.ping = (data, callback) => {
  const { headers, payload } = data
  callback(200, { headers, payload })
}

/**
 * 404 route handler.
 *
 * @type {RequestHandler}
 */
handlers.notFound = (data, callback) => {
  callback(404, { message: 'not found' })
}

module.exports = handlers
