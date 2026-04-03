/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { getTSConfigForContext } = require("./get-tsconfig")
const isTypescript = require("./is-typescript")

/**
 * @typedef {string[]} TryExtensions
 */

/** @type {TryExtensions} */
const DEFAULT_JS_VALUE = [".js", ".json", ".node", ".mjs", ".cjs"]
/** @type {TryExtensions} */
const DEFAULT_TS_VALUE = [
    ".js",
    ".ts",
    ".mjs",
    ".mts",
    ".cjs",
    ".cts",
    ".json",
    ".node",
]

/**
 * Gets `tryExtensions` property from a given option object.
 *
 * @param {unknown} option - An option object to get.
 * @returns {TryExtensions | undefined} The `tryExtensions` value, or `null`.
 */
function get(option) {
    if (
        option != null &&
        typeof option === "object" &&
        "tryExtensions" in option &&
        Array.isArray(option?.tryExtensions)
    ) {
        return option.tryExtensions.map(String)
    }
}

/**
 * Gets "tryExtensions" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.n` | `settings.node` property, then returns it if exists.
 * 3. This returns `[".js", ".json", ".node", ".mjs", ".cjs"]`.
 *
 * @param {import('eslint').Rule.RuleContext} context - The rule context.
 * @returns {TryExtensions} A list of extensions.
 */
module.exports = function getTryExtensions(context, optionIndex = 0) {
    const configured =
        get(context.options?.[optionIndex]) ??
        get(context.settings?.n) ??
        get(context.settings?.node)

    if (configured != null) {
        return configured
    }

    if (isTypescript(context) === false) {
        return DEFAULT_JS_VALUE
    }

    const allowImportingTsExtensions =
        getTSConfigForContext(context)?.config?.compilerOptions
            ?.allowImportingTsExtensions

    if (allowImportingTsExtensions === true) {
        return DEFAULT_TS_VALUE
    }

    return DEFAULT_JS_VALUE
}

module.exports.schema = {
    type: "array",
    items: {
        type: "string",
        pattern: "^\\.",
    },
    uniqueItems: true,
}
