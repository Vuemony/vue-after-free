/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

/**
 * @typedef {string[]} ResolvePaths
 */

/** @type {ResolvePaths} */
const DEFAULT_VALUE = []

/**
 * Gets `resolvePaths` property from a given option object.
 *
 * @param {unknown} option - An option object to get.
 * @returns {ResolvePaths | undefined} The `allowModules` value, or `null`.
 */
function get(option) {
    if (
        option != null &&
        typeof option === "object" &&
        "resolvePaths" in option &&
        Array.isArray(option?.resolvePaths)
    ) {
        return option.resolvePaths.map(String)
    }
}

/**
 * Gets "resolvePaths" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.n` | `settings.node` property, then returns it if exists.
 * 3. This returns `[]`.
 *
 * @param {import('eslint').Rule.RuleContext} context - The rule context.
 * @returns {ResolvePaths} A list of extensions.
 */
module.exports = function getResolvePaths(context, optionIndex = 0) {
    return (
        get(context.options?.[optionIndex]) ??
        get(context.settings?.n) ??
        get(context.settings?.node) ??
        DEFAULT_VALUE
    )
}

module.exports.schema = {
    type: "array",
    items: { type: "string" },
    uniqueItems: true,
}
