/**
 * For unimplemented abstract methods.
 */
class NotImplementedError extends Error {
  /**
   * @param {string} [message]
   */
  constructor(message) {
    super(message || 'not implemented')
  }
}

/**
 * Thrown when a stripe payment error occurs.
 */
class PaymentError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }
}

/**
 * Thrown when a mailgun error occurs.
 */
class MailError extends Error {
  constructor(message) {
    super(message)
  }
}

module.exports = {
  NotImplementedError,
  MailError,
  PaymentError
}
