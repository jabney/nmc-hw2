
const reAlpha = /^[A-Za-z]+$/
const reDigit = /^[0-9]+$/
const reAlphanumeric = /^[A-Za-z0-9]+$/

const validate = {
  any: {
    /**
     * @param {any} value
     */
    isString(value) {
      return typeof value === 'string'
    },
    /**
     * @param {any} value
     */
    isNumber(value) {
      return typeof value === 'number'
    },
    /**
     * @param {any} value
     */
    isBoolean(value) {
      return typeof value === 'boolean'
    },
    /**
     * @param {any} value
     */
    isObject(value) {
      return typeof value === 'object'
    },
    /**
     * @param {any} value
     */
    isFunction(value) {
      return typeof value === 'function'
    },
    /**
     * @param {any} value
     */
    isUndefined(value) {
      return typeof value === 'undefined'
    },
    /**
     * @param {any} value
     */
    isArray(value) {
      return Array.isArray(value)
    },
    /**
     * @param {any} value
     */
    isTruthy(value) {
      return !!value
    },
    /**
     * @param {any} value
     * @param {any[]} list
     */
    isIn(value, list) {
      return list.includes(value)
    },
  },

  string: {
    /**
     * @param {string} str
     */
    isDate(str) {
      return typeof new Date(str) !== 'undefined'
    },
    /**
     * @param {string} str
     */
    isLength(str, min, max) {
      if (max) {
        return str.length >= min && str.length <= max
      } else {
        return str.length === min
      }
    },
    /**
     * @param {string} str
     */
    isNumeric(str) {
      // Check that str is truthy because Number('') == 0
      return !!str && Number(str) !== NaN
    },
    /**
     * @param {string} str
     */
    isAlpha(str) {
      return reAlpha.test(str)
    },
    /**
     * @param {string} str
     */
    isDigit(str) {
      return reDigit.test(str)
    },
    /**
     * @param {string} str
     */
    isAlphaNumeric(str) {
      return reAlphanumeric.test(str)
    },
    /**
     * @param {string} str
     * @param {RegExp} regex
     */
    matches(str, regex) {
      return regex.test(str)
    },
  },

  number: {
    /**
     * @param {number} num
     */
    isInteger(num) {
      return num % 1 === 0
    },
    /**
     * @param {number} num
     */
    isFloat(num) {
      return num % 1 !== 0
    },
    /**
     * @param {number} num
     * @param {number} min
     * @param {number} max
     */
    isInRange(num, min, max) {
      return num >= min && num <= max
    },
  },

  boolean: {
    /**
     * @param {boolean} bool
     */
    isTrue(bool) {
      return bool === true
    },
  },

  array: {
    /**
     * @param {any[]} list
     * @param {number} min
     * @param {number} max
     */
    isLength(list, min, max) {
      if (max) {
        return list.length >= min && list.length <= max
      } else {
        return list.length === min
      }
    },
    /**
     * @param {any[]} list
     * @param {any} value
     */
    contains(list, value) {
      return list.includes(value)
    },
  },
}

module.exports = validate
