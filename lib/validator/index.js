const ValidationSource = require('./lib/validation-source')

/**
 * @typedef {ValidationSource.ValidationError} ValidationError
 */

/**
 * @typedef {Object} RequestData
 * @property {{[key: string]: string|string[]}} query
 * @property {{[key: string]: string}} headers
 * @property {Object} payload
 */

class Validator {
  /**
   * @param {RequestData} [requestData]
   */
  constructor(requestData) {
    this._requestData = requestData
    this._source = new ValidationSource(this)

    /** @type {string} */
    this._valueName = null
  }

  /**
   * Initializer. Set the name of the value.
   *
   * @param {string} valueName
   */
  name(valueName) {
    this._clearState()
    this._valueName = valueName
    return this._source
  }

  /**
   * Return errors array generated during validation.
   *
   * @returns {ValidationError[]}
   */
  errors() {
    return JSON.parse(JSON.stringify(this._source._runner._errors))
  }

  /**
   * Return the values object built during validation.
   *
   * @returns {any}
   */
  getValues() {
    return JSON.parse(JSON.stringify(this._source._runner._values))
  }

  /**
   * Clear resettable state.
   *
   * @returns {Validator}
   */
  _clearState() {
    this._valueName = null
    this._source._clearState()
    return this
  }
}

module.exports = Validator
