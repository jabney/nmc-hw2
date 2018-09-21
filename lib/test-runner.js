const assert = require('assert')

const esc = require('./colors')

/**
 * @typedef {{name: string, test: () => void}} Test
 */

/**
 * @typedef {{name: string, tests: Test[]}} Suite
 */

/**
 * @type {Suite[]}
 */
const _suites = []

/**
 * @type {number}
 */
let _passed = 0

/**
 * @type {number}
 */
let _failed = 0

/**
 * @param {string} name
 * @param {'pending'|'passed'|'failed'} status
 */
const printStatus = function printStatus(name, status) {
  switch(status) {
    case 'pending': return process.stdout.write(`    ${esc.reset}${name}`)
    case 'passed': return process.stdout.write(`\r  ${esc.green}√${esc.reset} ${name}\n`)
    case 'failed': return process.stdout.write(`\r  ${esc.red}x${esc.reset} ${name}\n`)
  }
}

/**
 * Run a test suite.
 *
 * @param {Suite} suite
 */
const runSuite = function runSuite(suite) {
  process.stdout.write(`\n${suite.name} (${suite.tests.length} tests)\n`)

  /**
   * @type {Error[]}
   */
  const failed = []

  // Iterate each test.
  suite.tests.forEach((test) => {
    printStatus(test.name, 'pending')

    try {
      test.test()
      printStatus(test.name, 'passed')
      _passed += 1
    } catch (error) {
      _failed += 1
      printStatus(test.name, 'failed')
      process.stderr.write(`\n${error.stack}\n`)
    }
  })
}

/**
 * Run the tests.
 */
exports.run = function run() {
  process.stdout.write(`Running ${_suites.length} test suite(s)...\n`)

  // Run each test suite.
  _suites.forEach(runSuite)

  setTimeout(() => {
    process.stdout.write('\n')
    process.stdout.write(`${_passed } tests passed\n`)

    // Check for failures.
    if (_failed > 0) {
      process.stderr.write(`${_failed } tests failed\n`)
    }
  })
}

/**
 * Add tests to the internal list.
 *
 * @param {Suite} suite
 */
exports.add = function add(suite) {
  _suites.push(suite)
}

/**
 * Clear all tests from the internal list.
 */
exports.clear = function clear() {
  while (_suites.length > 0) { _suites.pop() }
}
