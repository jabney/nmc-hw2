const assert = require('assert')
const runner = require('../test-runner')
const Validator = require('.')
const api = require('../../api/api')

/**
 * @type {api.RequestData}
 */
const requestData = {
  headers: { name: 'Value' },
  query: {},
  payload: { name: 10 },
  method: '',
  path: '',
}

/**
 * @type {runner.Test[]}
 */
const tests = []

tests.push({ name: 'handles explicit value setting', test: () => {
  const validator = new Validator()

  const value = validator
    .name('value')
    .value('Value')
    .get()

  const errors = validator.errors()

  assert.equal(errors.length, 0, 'does not have errors')
  assert.equal(value, 'Value', 'has correct value')
}})

tests.push({ name: 'handles values from request data', test: () => {
  const validator = new Validator(requestData)

  const value = validator
    .name('name')
    .from('headers')
    .get()

  const errors = validator.errors()

  assert.equal(errors.length, 0, 'does not have errors')
  assert.equal(value, 'Value', 'has correct value')
}})


// tests.push({ name: 'Test 2', test: () => {
//   const v = new Validator()

//   const value = v
//     .name('value')
//     .value('Value')
//     .isString()

//   // assert(false, 'Should not assert false')
// }})

/**
 * @type {runner.Suite}
 */
module.exports = { name: 'Validator', tests }

// const Validator = require('./lib/validator/validator')


// const validator = new Validator(data)

// validator
//   .name('userName')
//   .from('query')
//   // .optional()
//   .isString({trim: true})
//   .isLength({min: 10, max: 10})
//   // .isNumber()

// console.log(validator.errors())
// console.log(validator.getValues())
