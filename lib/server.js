/**
 * Create and start HTTP and HTTPS servers.
 */

const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')

const config = require('../config')
const requestHandler = require('./request-handler')
const bodyParser = require('./body-parser')
const loggerConfig = require('./logger')

const logger = loggerConfig()

/**
 * @param {bodyParser.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const handleRequest = async (req, res) => {
  // Log request and response info.
  logger(req, res)

  try {
    // Parse request body.
    await bodyParser(req, res)

    // Handle the request.
    requestHandler(req, res)

  } catch (error) {
    // Log the error.
    console.error(error)
  }
}

/**
 * Create an https options object.
 *
 * @type {https.ServerOptions}
 */
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem')),
}

// Create the module object.
const server = {}

// Instantiate the http server.
server.httpServer = http.createServer(handleRequest)

// Instantiate the http server.
server.httpsServer = https.createServer(httpsOptions, handleRequest)

/**
 * Initialize the server.
 */
server.init = function init() {
  // Start the http server.
  server.httpServer.listen(config.httpPort, () => {
    console.log(`(HTTP) Listening on port ${config.httpPort}`)
  })

  // Start the http server.
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(`(HTTPS) Listening on port ${config.httpsPort}`)
  })
}

module.exports = server
