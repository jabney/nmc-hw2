const esc = require('./colors')

/**
 * @typedef {{name: string, test: () => void}} Test
 */

/**
 * @typedef {{name: string, tests: Test[]}} Suite
 */

/**
 * @typedef {Object} TestResult
 * @property {string} name
 * @property {'passed'|'failed'} status
 * @property {string} [error]
 */

/**
 * A list of test suites to run.
 *
 * @type {Suite[]}
 */
const _suites = []

/**
 * Print the status of a test: pending, passed, or failed.
 *
 * @param {TestResult} result
 */
const printStatus = function printStatus(result) {
  switch(result.status) {
    case 'passed':
      process.stdout.write(`  ${esc.green}√${esc.reset} ${result.name}\n`)
      break;
    case 'failed':
      process.stdout.write(`  ${esc.red}x${esc.reset} ${result.name}\n`)
      process.stdout.write(`\n  ${esc.red}${result.error}${esc.reset}\n`)
      break;
  }
}

/**
 * Run a test suite.
 *
 * @param {Suite} suite
 *
 * @returns {Promise<TestResult[]>}
 */
const runSuite = async function runSuite(suite) {
  // Run each test in the suite.
  const results = await Promise.all(suite.tests.map(async (test) => {
    const name = test.name

    try {
      // Run the test.
      await test.test()

      /**
       * The test passed.
       *
       * @type {TestResult}
       */
      const result = { name, status: 'passed' }
      return result

    } catch (error) {
      /**
       * The test failed.
       *
       * @type {TestResult}
       */
      const result = { name, status: 'failed', error: error.stack }
      return result
    }
  }))

  return results
}

/**
 * Run the tests.
 */
exports.run = async function run() {
  process.stdout.write(`Running ${_suites.length} test suite(s)...\n`)

  // Track number of passed and failed tests.
  let passed = 0
  let failed = 0

  // Run each test suite.
  await Promise.all(_suites.map(async (suite) => {
    // Run the suite.
    const results = await runSuite(suite)

    // Add to the number of passed tests for this suite.
    passed += results.reduce((total, result) => {
      return total + (result.status === 'passed' ? 1 : 0)
    }, 0)

    // Add to the number of failed tests for this suite.
    failed += suite.tests.length - passed

    // Print the suite and the number of tests it contains.
    process.stdout.write(`\n${suite.name} (${suite.tests.length} tests)\n`)

    // Print the test result status messages.
    results.forEach(printStatus)

    return results
  }))

  // Wait a tick so that these messages occur and end of output.
  setTimeout(() => {
    process.stdout.write('\n')
    process.stdout.write(`${passed } tests passed\n`)

    // Check for failures.
    if (failed > 0) {
      process.stderr.write(`${failed } tests failed\n`)
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
