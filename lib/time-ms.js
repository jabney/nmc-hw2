/**
 * @typedef {Object} TimeObject
 * @property {number} [weeks]
 * @property {number} [days]
 * @property {number} [hours]
 * @property {number} [minutes]
 * @property {number} [seconds]
 * @property {number} [ms]
 */

const SEC_MS = 1000
const MIN_MS = SEC_MS * 60
const HOUR_MS = MIN_MS * 60
const DAY_MS = HOUR_MS * 24
const WEEK_MS = DAY_MS * 7

/**
 * @param {TimeObject} timeObj
 */
function timeMs(timeObj) {
  return (timeObj.ms || 0)
    + (timeObj.seconds || 0) * SEC_MS
    + (timeObj.minutes || 0) * MIN_MS
    + (timeObj.hours || 0) * HOUR_MS
    + (timeObj.days || 0) * DAY_MS
    + (timeObj.weeks || 0) * WEEK_MS
}

module.exports = timeMs
