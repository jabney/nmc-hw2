const Validator = require('..')
const ValidationRunner = require('./validation-runner')

/**
 * @typedef {ValidationRunner.ValidationError} ValidationError
 */

/**
 * @typedef {'headers'|'query'|'payload'} SourceName
 */

class ValidationSource {
  /**
   * @param {Validator} validator
   */
  constructor(validator) {
    this._validator = validator

    /** @type {SourceName} */
    this._sourceName = null

    /** @type {any} */
    this._value = null

    this._runner = new ValidationRunner(this)
  }

  /**
   * Set the type of request data source (headers, query, payload).
   * Exclusive of 'value'.
   *
   * @param {SourceName} sourceName
   */
  from(sourceName) {
    this._sourceName = sourceName
    return this._runner
  }

  /**
   * Set the value to validate. Exclusive of 'from'.
   *
   * @param {any} value
   */
  value(value) {
    this._value = value
    return this._runner
  }

  /**
   * Return the configured data object from the request data.
   */
  get _data() {
    const data = this._validator._requestData
    // A valid source name will be 'headers', 'query', or 'payload'.
    return data && data[this._sourceName]
  }

  /**
   * @param {string} valueName
   */
  _getValue(valueName) {
    const _data = this._data
    return _data && _data[valueName]
  }

  _clearState() {
    this._sourceName = null
    this._runner._clearState()
    return this
  }
}

module.exports = ValidationSource
