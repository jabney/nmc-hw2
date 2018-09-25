/**
 * For unimplemented abstract methods.
 */
class NotImplementedError extends Error {
  constructor() {
    super('not implemented')
  }
}

/**
 * For resource not found handling.
 */
class NotFoundError extends Error {
  constructor() {
    super('not found')
  }
}

module.exports = {
  NotImplementedError,
  NotFoundError,
}
