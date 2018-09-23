
const server = require('./lib/server')
const workers = require('./lib/workers')
const menu = require('./menu')

const app = {}

app.init = function init() {
  // Initialize the menu.
  menu.init()

  // Start the server.
  server.init()

  // Start the workers.
  workers.init()
}

app.init()

module.exports = app
