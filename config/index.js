/**
 * @typedef {Object} Environment
 * @property {string} name
 * @property {string|number} httpPort
 * @property {string|number} httpsPort
 * @property {string} hashingSecret
 * @property {number} maxChecks
 * @property {TwilioConfig} twilio
 */

/**
 * @typedef {Object} TwilioConfig
 * @property {string} fromPhone
 * @property {string} accountSid
 * @property {string} authToken
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
  twilio: {
    fromPhone: '+15005550006',
    accountSid: 'ACb32d411ad7fe886aac54c665d25e5c5d',
    authToken: '9455e3eb3109edc12e3d8c92768f7a67',
  },
}

/**
 * Create the production environment.
 */
environments.production = {
  name: 'production',
  httpPort: process.env.PORT || 5000,
  httpsPort: process.env.port || 5001,
  hashingSecret: HASHING_SECRET,
  maxChecks: 5,
  twilio: {
    fromPhone: '',
    accountSid: '',
    authToken: '',
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
