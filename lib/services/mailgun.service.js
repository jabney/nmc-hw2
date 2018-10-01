const https = require('https')

const config = require('../../config')
const request = require('../https-request')

const { createRandomString } = require('../helpers')

/**
 * Thrown when a mailgun error occurs.
 */
class MailError extends Error {
  constructor(message) {
    super(message)
  }
}

/**
 * Passed to the MailgunService constructor.
 *
 * @typedef {Object} MessageInfo
 * @property {string} to
 * @property {string} subject
 * @property {string} text
 * @property {string} [from]
 */

/**
 * Returned from the makeRequest function.
 *
 * @typedef {Object} MailFailure
 * @property {string} id
 */

/**
 * Create a request options object for tokens.
 *
 * @param {string} body
 * @param {string} contentType
 *
 * @returns {https.RequestOptions}
 */
function mailOptions(body, contentType) {
  const options = {
    protocol: 'https:',
    hostname: 'api.mailgun.net',
    method: 'POST',
    path: `/v3/${config.mailgun.domain}/messages`,
    auth: `api:${config.mailgun.key}`,
    headers: {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(body),
    }
  }

  return options
}

/**
 * Generate a multipart/form-data body
 *
 * @param {{[key: string]: any}} obj
 */
function multipartForm(obj) {
  // Generate a random string for use as the boundary separator.
  const boundary = `${createRandomString(16)}`

  // Get the key/value pairs from the object.
  const entries = Object.entries(obj)

  // Get a multipart header entry for every key/value pair.
  const headerEntry = entries.reduce((list, pair) => {
    const [key, val] = pair
    list.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}`)
    return list
  }, [])

  // Create the body from the header entries and bondary.
  const body = headerEntry.join('\r\n') + `\r\n--${boundary}--\r\n`

  // Create the info object to return.
  const info = {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`
  }

  return info
}

class MailgunService {
  /**
   * @param {MessageInfo} msginfo
   */
  constructor(msginfo) {
    this.msginfo = msginfo

    // Add the from field to the message info object.
    this.msginfo.from = `Big Bear's Pizza <bigbear@${config.mailgun.domain}>`
  }

  /**
   * Charge the card.
   *
   * @returns {Promise<any>}
   */
  async send() {
    // Get multipart form data from the message info object.
    const multipart = multipartForm(this.msginfo)

    // Get token request options
    const options = mailOptions(multipart.body, multipart.contentType)

    // Get the resonse data.
    const response = await request(options, multipart.body)

    // Parse json response.
    const responseObj = JSON.parse(response.body)

    // Check for an error code.
    if (response.code >= 400) {
      /**
       * @type {string}
       */
      const error = responseObj.message

      throw new MailError(error)
    }

    return responseObj
  }
}

module.exports = MailgunService
