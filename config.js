const timeMs = require('./lib/time-ms')

/**
 * @typedef {Object} Environment
 * @property {string} name
 * @property {string|number} httpPort
 * @property {string|number} httpsPort
 * @property {string} hashingSecret
 * @property {number} maxChecks
 * @property {number} authTokenExpMs
 * @property {StripeConfig} stripe
 */

/**
 * @typedef {Object} StripeConfig
 * @property {string} privateKey
 * @property {string} publicKey
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
  hashingSecret: HASHING_SECRET,
  maxChecks: 5,
  authTokenExpMs: timeMs({hours: 24}),
  stripe: {
    privateKey: process.env.STRIPE_PRIVATE_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY
  },
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
    privateKey: process.env.STRIPE_PRIVATE_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY
  },
}

/**
 * Get the environment name from the system environment.
 */
const envName = process.env.NODE_ENV || 'staging'

/**
 * Get the environment object from the environment name.
 * Fall back to the staging environment.
 */
const exportedEnv = environments[envName.toLowerCase()] || environments.staging

/**
 * Export the selected environment object.
 */
module.exports = exportedEnv
