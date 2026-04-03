/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

/**
 * @param {unknown} path
 * @returns {string}
 */
module.exports = function stripImportPathParams(path) {
    const pathString = String(path)
    const index = pathString.indexOf("!")

    if (index === -1) {
        return pathString
    }

    return pathString.slice(0, index)
}
