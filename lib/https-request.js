const https = require('https')
const http = require('http')

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

    // Build up the buffer when data comes in.
    res.on('data', (data) => {
      buffer.push(data.toString())
    })

    // When finished, resolve the promise.
    res.on('end', () => {
      resolve(buffer.join(''))
    })

    // An error occurred. Reject the promise.
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
function httpsRequest(options, payload) {
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

module.exports = httpsRequest
