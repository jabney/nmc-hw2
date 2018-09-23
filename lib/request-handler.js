/**
 * Request handler module.
 */
const url = require('url')
const util = require('util')

const api = require('../api/api')
const colors = require('./colors')

// Configure the debug logger.
const debug = util.debuglog('debug')

/**
 * @typedef {{[key: string]: api.RequestHandler}} Router
 */

// Create unified logic for http and https servers.
const handler = function handler(req, res) {
  // Get the url and parse it.
  const parsedUrl = url.parse(req.url, true)

  // Get the url path.
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query object.
  const query = parsedUrl.query

  // Get the HTTP method.
  const method = req.method.toLowerCase()

  // Get the request headers.
  const headers = req.headers

  // Choose the handler for this request.
  const handler = router[trimmedPath] || api.notFound

  /**
   * Create a data object to pass to the handler.
   *
   * @type {api.RequestData}
   */
  const data = {
    query,
    method,
    headers,
    path: trimmedPath,
    payload: req.body
  }

  // Call the handler defined previously.
  handler(data, (code, data) => {
    // Set a fallback for status code.
    const statusCode = typeof code == 'number' ? code : 200

    // Set a fallback for the data payload.
    const payload = typeof data === 'object' ? data : {}

    // Stringify Json.
    const json = JSON.stringify(payload)

    // Set the content type header.
    res.setHeader('Content-Type', 'application/json')

    // Send the response.
    res.writeHead(statusCode)
    res.end(json)

    debug(`${colors.cyan}Response body:`, json, colors.reset)
  })
}

/**
 * Create the router.
 *
 * @type {Router}
 */
const router = {
  ping: api.ping,
  users: api.users,
  tokens: api.tokens,
  menu: api.menu,
}

module.exports = handler
