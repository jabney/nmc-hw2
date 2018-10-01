/**
 * Convert seconds, minutes, hours, days, or weeks to milliseconds.
 */

/**
 * @typedef {Object} TimeObject
 * @property {number} [weeks]
 * @property {number} [days]
 * @property {number} [hours]
 * @property {number} [minutes]
 * @property {number} [seconds]
 * @property {number} [ms]
 */

const SEC_MS = 1000           // 1000 milliseconds per second
const MIN_MS = SEC_MS * 60    // 60 seconds per minute
const HOUR_MS = MIN_MS * 60   // 60 minutes per hour
const DAY_MS = HOUR_MS * 24   // 24 hours per day
const WEEK_MS = DAY_MS * 7    // 7 days per week

/**
 * Return the number of milliseconds specified
 * in the time object.
 *
 * @param {TimeObject} timeObj
 */
function timeMs(timeObj) {
  // Presume zero for any absent time object property.
  const ms = (timeObj.ms || 0)
    + (timeObj.seconds || 0) * SEC_MS
    + (timeObj.minutes || 0) * MIN_MS
    + (timeObj.hours || 0) * HOUR_MS
    + (timeObj.days || 0) * DAY_MS
    + (timeObj.weeks || 0) * WEEK_MS

  return ms
}

module.exports = timeMs
