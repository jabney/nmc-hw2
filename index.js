
const server = require('./lib/server')

const app = {}

app.init = function init() {
  // Start the server.
  server.init()
}

app.init()

module.exports = app
