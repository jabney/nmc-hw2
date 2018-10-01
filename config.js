const timeMs = require('./lib/time-ms')

const { createRandomString } = require('./lib/helpers')

/**
 * @typedef {Object} Environment
 * @property {string} name
 * @property {string|number} httpPort
 * @property {string|number} httpsPort
 * @property {string} hashingSecret
 * @property {number} maxChecks
 * @property {number} authTokenExpMs
 * @property {StripeConfig} stripe
 * @property {MailgunConfig} mailgun
 */

/**
 * @typedef {Object} StripeConfig
 * @property {string} key
 */

/**
 * @typedef {Object} MailgunConfig
 * @property {string} key
 * @property {string} domain
 */

const HASHING_SECRET = process.env.HASHING_SECRET

/**
 * Create an environments container.
 *
 * @type {{[name: string]: Environment}}
 */
const environments = {}

/**
 * Create the staging environment.
 */
environments.staging = {
  name: 'staging',
  httpPort: 3000,
  httpsPort: 3001,
  hashingSecret: HASHING_SECRET || createRandomString(16),
  maxChecks: 5,
  authTokenExpMs: timeMs({hours: 24}),
  stripe: {
    key: process.env.STRIPE_PRIVATE_KEY,
  },
  mailgun: {
    key: process.env.MAILGUN_API_KEY,
    domain: 'sandboxa829973ebc32434bbe472c1cb3c03496.mailgun.org',
  }
}

/**
 * Create the production environment.
 */
environments.production = {
  name: 'production',
  httpPort: 5000,
  httpsPort: 5001,
  hashingSecret: HASHING_SECRET,
  maxChecks: 5,
  authTokenExpMs: timeMs({hours: 24}),
  stripe: {
    key: process.env.STRIPE_PRIVATE_KEY,
  },
  mailgun: {
    key: process.env.MAILGUN_API_KEY,
    domain: 'sandboxa829973ebc32434bbe472c1cb3c03496.mailgun.org',
  }
}

/**
 * Get the environment name from the system environment.
 */
const envName = process.env.NODE_ENV || 'staging'

// In production a hashing secret must be explicitly set in environment.
if (envName === 'production' && !HASHING_SECRET) {
  throw new Error('<config> hashing secret must be set in the environment')
}

/**
 * Get the environment object from the environment name.
 * Fall back to the staging environment.
 */
const exportedEnv = environments[envName.toLowerCase()] || environments.staging

/**
 * Export the selected environment object.
 */
module.exports = exportedEnv
