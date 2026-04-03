/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

/**
 * @typedef {string[]} AllowModules
 */

/**
 * @type {AllowModules}
 */
const DEFAULT_VALUE = []

/**
 * @typedef {{allowModules?: AllowModules}|undefined} Option
 */

/**
 * Gets `allowModules` property from a given option object.
 *
 * @param {Option} option - An option object to get.
 * @returns {AllowModules|null} The `allowModules` value, or `null`.
 */
function get(option) {
    if (Array.isArray(option?.allowModules)) {
        return option.allowModules.map(String)
    }
    return null
}

/**
 * Gets "allowModules" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.n` | `settings.node` property, then returns it if exists.
 * 3. This returns `[]`.
 *
 * @param {import('eslint').Rule.RuleContext} context - The rule context.
 * @returns {AllowModules} A list of extensions.
 */
module.exports = function getAllowModules(context) {
    return (
        get(/** @type {Option} */ (context.options[0])) ??
        get(/** @type {Option} */ (context.settings?.n)) ??
        get(/** @type {Option} */ (context.settings?.node)) ??
        DEFAULT_VALUE
    )
}

module.exports.schema = {
    type: "array",
    items: {
        type: "string",
        pattern: "^(?:virtual:)?(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$",
    },
    uniqueItems: true,
}
