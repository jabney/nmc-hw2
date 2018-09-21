/**
 * API module - defines APIs for handling requests.
 */
const userHandlers = require('./users.api')
const tokenHandlers = require('./tokens.api')

/**
 * @typedef {Object} RequestData
 * @property {{[key: string]: string|string[]}} query
 * @property {string} method
 * @property {{[key: string]: string}} headers
 * @property {string} path
 * @property {Object} payload
 */

/**
 * @typedef {Object} UserRecord
 * @property {string} email
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [password]
 * @property {boolean} [tosAgreement]
 * @property {string[]} [checks]
 */

/**
 * @typedef {Object} TokenData
 * @property {string} id
 * @property {string} [email]
 * @property {number} [expires]
 * @property {boolean} [extend]
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

    // Check that the method is in the list of allowed methods.
    if (allowedMethods.includes(method)) {
      return apiLib[method](data, response)
    }

    // Method not allowed.
    response(405, { error: 'method not allowed' })
  }
}

/**
 * Create route handlers container.
 *
 * @type {{[key: string]: RequestHandler}}
 */
const handlers = {}

// Create user handlers.
handlers.users = createLibHandler(userHandlers, ['post', 'get', 'put', 'delete'])

// Create token handlers.
handlers.tokens = createLibHandler(tokenHandlers, ['post', 'get', 'put', 'delete'])

/**
 * Ping route handler.
 *
 * @type {RequestHandler}
 */
handlers.ping = (data, callback) => {
  const { payload } = data
  callback(200, { payload })
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
