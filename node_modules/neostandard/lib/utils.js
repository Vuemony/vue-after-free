'use strict'

/**
 * Array.isArray() on its own give type any[]
 *
 * @param {unknown} value
 * @returns {value is unknown[]}
 */
function typesafeIsArray (value) {
  return Array.isArray(value)
}

/**
 * @param {unknown} value
 * @returns {value is string[]}
 */
function isStringArray (value) {
  if (!typesafeIsArray(value)) return false
  return value.every(item => typeof item === 'string')
}

/**
 * @param {object} value
 * @returns {boolean}
 */
function isNonEmpty (value) {
  return Object.keys(value).length !== 0
}

module.exports = {
  isNonEmpty,
  isStringArray,
}
