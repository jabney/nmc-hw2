const assert = require('assert')

const runner = require('../test-runner')
const timeMs = require('../time-ms')
const Token = require('./token.model')

const TEST_EMAIL = 'tests@example.com'

/**
 * @type {runner.Test[]}
 */
const tests = []

tests.push({ name: 'static create method creates a token', test: async () => {
  // Create a token.
  const token1 = await Token.create(TEST_EMAIL, timeMs({seconds: 10}))

  // Create a new token with the same id.
  const token2 = new Token(token1.id)

  // Load from storage.
  await token2.load()

  assert.equal(token2.id, token1.id, 'ids should be the same')

  // Delete the token (both token1 and token2 point to the same file).
  await token1.delete()
}})

tests.push({ name: 'verify fails expired tokens', test: async () => {
  // Create a token with future expiration.
  const token1 = await Token.create(TEST_EMAIL, timeMs({seconds: 10}))

  // Verify the token.
  assert(token1.verify(), 'token should pass verification')

  // Create a new token with immediate expiration.
  const token2 = await Token.create(TEST_EMAIL, timeMs({ms: 0}))

  // Verify the token.
  assert(!token2.verify(), 'token should fail verification')

  token1.delete()
  token2.delete()
}})

tests.push({ name: 'token can be extended', test: async () => {
  // Create a token with immediate expiration.
  const token = await Token.create(TEST_EMAIL, timeMs({ms: 0}))

  // Verify the token.
  assert(!token.verify(), 'token should fail verification')

  token.extend(timeMs({ms: 1000}))

  // Verify the token.
  assert(token.verify(), 'token should pass verification')
}})

module.exports = { name: 'Token Model', tests }
