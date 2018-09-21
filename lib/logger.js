const http = require('http')

const esc = require('./colors')

/**
 * @typedef {http.IncomingMessage} Request
 * @typedef {http.ServerResponse} Response
 */

// /**
//  * @typedef {'reset'|'bold'|'faint'|'black'|'red'|'green'|'yellow'|'blue'|'magenta'|'cyan'|'white'} ColorName
//  */

/**
 * @typedef {'ge500'|'ge400'|'ge200'|'ge0'} ColorVars
 */

/**
 * @typedef {{[K in ColorVars]?: esc.ColorName}} ResponseColors
 */

// Alias for standard out write method.
const write = process.stdout.write.bind(process.stdout)

/**
 * @type {ResponseColors}
 */
const defaultColors = {
  ge500: 'red',
  ge400: 'yellow',
  ge200: 'green',
  ge0: 'magenta',
}

/**
 * Return a logger configured with the supplied output function.
 *
 * @param {null | ((message: string) => void)} [log]
 * @param {boolean} [showColors]
 * @param {ResponseColors} [colors]
 */
function loggerConfig(log=write, showColors=true, colors=defaultColors) {
  // If null was specified for 'log', default to write.
  const _log = log || write

  // Merge default colors and colors given by user.
  const combined = {...defaultColors, ...colors}

  // Map color names to escape sequences.
  const _colors = Object.entries(combined).reduce((map, entry) => {
    const [key, colorName] = entry
    // e.g., map['ge500'] = '\x1b[31m'
    map[key] = esc[colorName]
    return map
  }, {})

  /**
   * Return the logger function.
   */
  return (/**@type {Request}*/ req, /**@type {Response}*/ res) => {
    res.on('finish', () => {
      // Get the request method.
      const method = req.method.toUpperCase()

      // Get teh request url.
      const url = req.url

      // Get the returned status code.
      const code = res.statusCode

      if (showColors) {
        // Output response code in color.
        const color = code >= 500
          ? _colors['ge500'] : code >= 400
          ? _colors['ge400'] : code >= 200
          ? _colors['ge200'] : _colors['ge0']

        // Build color-escaped output strings.
        const methodWithColor = `${esc.reset}${esc.bold}${method}${esc.reset}`
        const urlWithColor = `${esc.reset}${url}${esc.reset}`
        const codeWithColor = `${esc.reset}${color}${code}${esc.reset}`

        // Output colored request/response info.
        _log(`${methodWithColor} ${urlWithColor} ${codeWithColor}\n`)
      } else {
        // OUtput plain request/response info.
        _log(`${method} ${url} ${code}\n`)
      }
    })
  }
}

module.exports = loggerConfig
