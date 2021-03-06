const assert = require('assert')
const runner = require('../test-runner')
const Validator = require('.')
const api = require('../api')

/**
 * @type {api.RequestData}
 */
const requestData = {
  headers: { name: 'From Headers' },
  query: { name: 'From Query' },
  payload: { name: 'From Payload' },
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

  const headers = validator
    .name('name')
    .from('headers')
    .get()

  const query = validator
    .name('name')
    .from('query')
    .get()

  const payload = validator
    .name('name')
    .from('payload')
    .get()

  const errors = validator.errors()

  assert.equal(errors.length, 0, 'does not have errors')
  assert.equal(headers, 'From Headers', 'has correct value')
  assert.equal(query, 'From Query', 'has correct value')
  assert.equal(payload, 'From Payload', 'has correct value')
}})

/**
 * @type {runner.Suite}
 */
module.exports = { name: 'Validator', tests }
