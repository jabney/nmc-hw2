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
 * @param {'passed'|'failed'} status
 */
const printStatus = function printStatus(name, status) {
  switch(status) {
    case 'passed': return process.stdout.write(`  ${esc.green}√${esc.reset} ${name}\n`)
    case 'failed': return process.stdout.write(`  ${esc.red}x${esc.reset} ${name}\n`)
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

  // Run and wait for each suite.
  return Promise.all(suite.tests.map(async (test) => {
    try {
      // Run the test.
      await test.test()
      // The test passed.
      printStatus(test.name, 'passed')
      _passed += 1
    } catch (error) {
      // The test failed.
      _failed += 1
      printStatus(test.name, 'failed')
      process.stderr.write(`\n${error.stack}\n\n`)
    }
  }))
}

/**
 * Run the tests.
 */
exports.run = async function run() {
  process.stdout.write(`Running ${_suites.length} test suite(s)...\n`)

  // Run each test suite.
  await Promise.all(_suites.map(runSuite))

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
