const esc = require('./colors')

/**
 * @typedef {{name: string, test: () => void}} Test
 */

/**
 * @typedef {{name: string, tests: Test[]}} Suite
 */

/**
 * A list of test suites to run.
 *
 * @type {Suite[]}
 */
const _suites = []

/**
 * The number of tests that passed.
 *
 * @type {number}
 */
let _passed = 0

/**
 * The number of tests that failed.
 *
 * @type {number}
 */
let _failed = 0

/**
 * Print the status of a test: pending, passed, or failed.
 *
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
  // Print the suite and the number of tests it contains.
  process.stdout.write(`\n${suite.name} (${suite.tests.length} tests)\n`)

  /**
   * A list of failed test errors.
   *
   * @type {Error[]}
   */
  const failed = []

  // Iterate each test.
  suite.tests.forEach((test) => {
    printStatus(test.name, 'pending')

    try {
      // Run the test.
      test.test()
      // The test passed.
      printStatus(test.name, 'passed')
      _passed += 1
    } catch (error) {
      // The test failed.
      _failed += 1
      printStatus(test.name, 'failed')
      process.stderr.write(`\n${error.stack}\n\n`)
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

  // Wait a tick so that these messages occur and end of output.
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
