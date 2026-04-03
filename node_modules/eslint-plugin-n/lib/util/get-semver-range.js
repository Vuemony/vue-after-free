/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { Range } = require("semver")
const cache = new Map()

/**
 * Get the `semver.Range` object of a given range text.
 * @param {string} x The text expression for a semver range.
 * @returns {Range|undefined} The range object of a given range text.
 * It's null if the `x` is not a valid range text.
 */
module.exports = function getSemverRange(x) {
    const stringVersion = String(x)
    const cached = cache.get(stringVersion)
    if (cached != null) {
        return cached
    }

    try {
        const output = new Range(stringVersion)
        cache.set(stringVersion, output)
        return output
    } catch {
        // Ignore parsing error.
        cache.set(stringVersion, null)
    }
}
