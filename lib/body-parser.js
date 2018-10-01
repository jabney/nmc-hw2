
const http = require('http')
const querystring = require('querystring')

const { StringDecoder } = require('string_decoder')

/**
 * @typedef {{body: any}} RequestBody
 */
/**
 * @typedef {http.IncomingMessage & RequestBody} IncomingMessage
 */

/**
 * @param {string} str
 *
 * @return {Object}
 */
const parseAsJson = function parseAsJson(str) {
  try {
    const obj = JSON.parse(str)

    // If the result of parsing was not an object or array, throw.
    if (obj == null || typeof obj !== 'object') {
      throw new Error('json is not an object')
    }

    // Return the parsed object.
    return obj

  } catch (error) {
    console.warn('<bodyParser> could not parse json')
    return {}
  }
}

/**
 * @param {string} str
 *
 * @return {Object}
 */
const parseAsForm = function parseAsForm(str) {
  // Result should be ['key1=val1', 'key2=val2', ...].
  const keyValStrings = querystring.unescape(str)
    .split('&')
    .filter(x => !!x)

  // Create an object of key/val pairs.
  const obj = keyValStrings.reduce((map, pair) => {
    // Get key/val pair from each entry.
    const [key, val] = pair.split('=')

    // Check that we parsed a key/value pair before updating map.
    if (key && val) {
      map[key] = val
    }

    return map
  }, {})

  // The final object will contain keys and their values or be emtpy.
  return obj
}

/**
 * Conditionally parse body as json or form-urlencoded data.
 *
 * @param {IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const bodyParser = function (req, res) {
  return new Promise((resolve, reject) => {
    // Create a string decoder instance.
    const decoder = new StringDecoder('utf-8')

    // Get the headers.
    const headers = req.headers

    /**
     * Buffer for incoming request body.
     *
     * @type {string[]}
     */
    let buffer = []

    req.on('data', (chunk) => {
      // For each data event, append to the buffer.
      buffer.push(decoder.write(chunk))
    })

    req.on('end', () => {
      // Finish decoding.
      buffer.push(decoder.end())

      // Join string fragments.
      const body = buffer.join('')

      // Get the content type from the headers.
      const contentType = headers['content-type']

      switch(contentType) {
        // No content type: set the request body as the received string.
        case undefined:
          req.body = body; break
        case 'application/json':
          // Parse the body as json.
          req.body = parseAsJson(body); break
        case 'application/x-www-form-urlencoded':
          // Parse the body as form data.
          req.body = parseAsForm(body); break
        case 'text/plain':
        case 'application/javascript':
        case 'application/xml':
        case 'text/xml':
        case 'text/html':
        default:
          // Set the body as the string buffer.
          req.body = body
      }

      // Resolve the promise.
      resolve()
    })
  })
}

module.exports = bodyParser
