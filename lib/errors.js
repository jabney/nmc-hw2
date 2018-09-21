/**
 * For unimplemented abstract methods.
 */
class NotImplementedError extends Error {
  constructor() {
    super('not implemented')
  }
}

module.exports = {
  NotImplementedError
}
