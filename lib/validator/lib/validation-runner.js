const validate = require('./validate')
const ValidationSource = require('./validation-source')

/**
 * @typedef ValidationError
 * @property {string} from
 * @property {string} name
 * @property {string} error
 */

/**
 * @typedef {Object} ValidationResult
 */

/**
 * @typedef ValidationOptions
 * @property {string} [msg]
 */

/**
 * @typedef {Object} IsInRangeOptions
 * @property {number} [min]
 * @property {number} [max]
 */

/**
 * @typedef {Object} IsLengthOptions
 * @property {number} [min]
 * @property {number} [max]
 */

/**
 * @typedef {Object} IsStringOptions
 * @property {boolean} [trim]
 */

class ValidationRunner {

  /**
   * @param {ValidationSource} source
   */
  constructor(source) {
    this._source = source

    /** @type {boolean} */
    this._optional = false

    /** @type {boolean} */
    this._errorState = false

    /** @type {{[key: string]: any}} */
    this._values = {}

    /** @type {ValidationError[]} */
    this._errors = []
  }

  /**
   * Value is optional, don't validate if value is undefined.
   */
  optional() {
    this._optional = true
    return this
  }

  /**
   * @param {IsStringOptions & ValidationOptions} options
   */
  isString(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      if (typeof value !== 'string') {
        const message = options.msg || 'is not a string'
        this._errors.push(this._errorFactory('isString', message))
        this._setErrorState()
      } else {
        this._setValue(options.trim ? value.trim() : value)
      }
    }

    return this
  }

  /**
   * @param {ValidationOptions} options
   */
  isNumber(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      if (typeof value !== 'number') {
        const message = options.msg || 'is not a number'
        this._errors.push(this._errorFactory('isNumber', message))
        this._setErrorState()
        this._pullFromValues()
      } else {
        this._setValue(value)
      }
    }

    return this
  }

  /**
   *
   * @param {IsInRangeOptions & ValidationOptions} options
   */
  isInRange(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      if (typeof value === 'number') {
        const { min = -Infinity, max = Infinity } = options

        if (value < min || value > max) {
          const message = options.msg || 'is out of range'
          this._errors.push(this._errorFactory('isInRange', message))
          this._setErrorState()
        } else {
          this._setValue(value)
        }
      }
    }

    return this
  }

  /**
   * @param {ValidationOptions} options
   */
  isInteger(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      if (typeof value === 'number') {
        if (value % 1 !== 0) {
          const message = options.msg || 'is not an integer'
          this._errors.push(this._errorFactory('isInteger', message))
          this._setErrorState()
        } else {
          this._setValue(value)
        }
      }
    }

    return this
  }

  /**
   * @param {ValidationOptions} options
   */
  isObject(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      // Value must be an object but not an array.
      if (value === null || typeof value !== 'object' || validate.any.isArray(value)) {
        const message = options.msg || 'is not an object'
        this._errors.push(this._errorFactory('isObject', message))
        this._setErrorState()
      } else {
        this._setValue(value)
      }
    }

    return this
  }

  /**
   * @param {ValidationOptions} options
   */
  isBoolean(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      if (typeof value !== 'boolean') {
        const message = options.msg || 'is not a boolean'
        this._errors.push(this._errorFactory('isBoolean', message))
        this._setErrorState()
      } else {
        this._setValue(value)
      }
    }

    return this
  }

  /**
   * @param {ValidationOptions} options
   */
  isTruthy(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      if (!validate.any.isTruthy(value)) {
        const message = options.msg || 'is not truthy'
        this._errors.push(this._errorFactory('isTruthy', message))
        this._setErrorState()
      } else {
        this._setValue(value)
      }
    }

    return this
  }

  /**
   * @param {ValidationOptions} options
   */
  isTrue(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()

    if (!this._isOptional(value)) {
      if (!validate.boolean.isTrue(value)) {
        const message = options.msg || 'is not true'
        this._errors.push(this._errorFactory('isTrue', message))
        this._setErrorState()
      } else {
        this._setValue(value)
      }
    }

    return this
  }

  /**
   * @param {IsLengthOptions & ValidationOptions} options
   */
  isLength(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()
    const { min = 0, max = Infinity } = options

    if (!this._isOptional(value)) {
      if (typeof value === 'string' || Array.isArray(value)) {
        const message = options.msg || 'is out of range'
        const len = value.length

        if (len < min || len > max) {
          this._errors.push(this._errorFactory('isLength', message))
          this._setErrorState()
        } else {
          this._setValue(value)
        }
      }
    }

    return this
  }

  /**
   * @param {any[]} list
   * @param {ValidationOptions} options
   */
  isIn(list, options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()
    const message = options.msg || 'is not in list'

    if (!this._isOptional(value)) {
      if (!validate.any.isIn(value, list)) {
        this._errors.push(this._errorFactory('isIn', message))
        this._setErrorState()
      } else {
        this._setValue(value)
      }
    }

    return this
  }

  /**
   * @param {ValidationOptions} options
   */
  isArray(options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()
    const message = options.msg || 'is not an array'

    if (!this._isOptional(value)) {
      if (!validate.any.isArray(value)) {
        this._errors.push(this._errorFactory('isArray', message))
        this._setErrorState()
      } else {
        this._setValue(value)
      }
    }

    return this
  }

  /**
   * @param {RegExp} expr
   * @param {ValidationOptions} options
   */
  matches(expr, options = {}) {
    if (this._errorState) { return this }

    const value = this._getValue()
    const message = options.msg || 'does not match'

    if (!this._isOptional(value)) {
      if (typeof value === 'string') {
        if (!validate.string.matches(value, expr)) {
          this._errors.push(this._errorFactory('matches', message))
          this._setErrorState()
        } else {
          this._setValue(value)
        }
      }
    }

    return this
  }

  /**
   * Get the current value.
   */
  get() {
    return this._getValue()
  }

  /**
   * Getter for validator valueName.
   */
  get _valueName() {
    return this._source._validator._valueName
  }

  /**
   * Sets the errorState flag to true.
   */
  _setErrorState() {
    this._errorState = true
    return this
  }

  /**
   * Clears state in preperation for validating a new value.
   */
  _clearState() {
    this._errorState = false
    this._optional = false
    return this
  }

  /**
   * @param {any} value
   */
  _setValue(value) {
    if (typeof this._source._data !== 'undefined') {
      this._values[this._valueName] = value
    } else if (typeof this._source._value !== 'undefined') {
      this._source._value = value
    } else {
      throw new Error('<validator> neither source nor value exist')
    }
  }

  /**
   * Get the current value.
   */
  _getValue() {
    const name = this._valueName
    const dataValue = this._values[name] || this._source._getValue(name)
    return dataValue || this._source._value
  }

  /**
   * Pull a value from the values object. We do this when validation
   * fails, because the values object should only contain values
   * that have passed all validation checks.
   */
  _pullFromValues() {
    const values = this._values
    const value = values && values[this._valueName]

    if (typeof value !== 'undefined') {
      delete this._values[this._valueName]
    }
  }

  /**
   * Return true if the value is optional. Optional values must
   * be undefined in order to be considered optional.
   *
   * @param {any} value
   */
  _isOptional(value) {
    return this._optional && typeof value === 'undefined'
  }

  /**
   * Construct an error to be added to the errors array.
   *
   * @param {string} from
   * @param {string} message
   *
   * @return {ValidationError}
   */
  _errorFactory(from, message) {
    return {
      from: from,
      name: this._valueName,
      error: message,
    }
  }
}

module.exports = ValidationRunner
