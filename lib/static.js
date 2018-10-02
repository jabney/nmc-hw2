const fs = require('fs')
const url = require('url')
const path = require('path')
const http = require('http')

// Defne mime types for file extensions.
const mimeTypes = new Map([
  ['.txt', 'text/plain'],
  ['.html', 'text/html'],
  ['.css', 'text/css'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.gif', 'image/gif'],
  ['.bmp', 'image/bmp'],
  ['.mpeg', 'audio/mpeg'],
  ['.ogg', 'audio/ogg'],
  ['.ogg', 'audio/wav'],
  ['.mp4', 'video/mp4'],
  ['.webm', 'video/webm'],
  ['.json', 'application/json'],
  ['.js', 'application/javascript'],
  ['.xml', 'application/xml'],
  ['.pdf', 'application/pdf'],
])

/**
 * Serve static assets from the file system.
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function static(req, res) {
  // Get the url and parse it.
  const parsedUrl = url.parse(req.url, true)

  // Don't honor directory-walking path elements.
  if (/\.\./g.test(parsedUrl.path)) {
    res.writeHead(404)
    return res.end('not found')
  }

  // Don't trust the first path segment, e.g., /public/
  const requestPath = parsedUrl.path.replace(/\/.+?\//, '')

  // Get the path to the requested static file.
  const filePath = path.join(__dirname, `../public/${requestPath}`)

  // Check that the file exists before attempting to serve it.
  fs.stat(filePath, (error, stats) => {
    if (error || !stats) {
      res.writeHead(400)
      return res.end('not found')
    }

    // Get the file extension from the path.
    const ext = path.extname(requestPath)

    // Get the mime type from the map, based off of the file extension.
    const mimeType = mimeTypes.get(ext) || 'text/plain'

    // Create a read stream for the file path.
    const readStream = fs.createReadStream(filePath)

    // Set the content type header.
    res.setHeader('Content-Type', mimeType)

    // Transfer the file data.
    readStream.pipe(res)
  })
}

module.exports = static
