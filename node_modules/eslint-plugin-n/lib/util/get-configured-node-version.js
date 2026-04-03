/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { Range } = require("semver")
const { getPackageJson } = require("./get-package-json")
const getSemverRange = require("./get-semver-range")

const fallbackRange = new Range(">=16.0.0")

/**
 * @typedef {{ version:? string } | undefined} VersionOption
 */

/**
 * Gets `version` property from a given option object.
 *
 * @param {VersionOption} option - An option object to get.
 * @returns {import("semver").Range|undefined} The `allowModules` value, or `null`.
 */
function getVersionRange(option) {
    if (option?.version) {
        return getSemverRange(option.version)
    }
}
/**
 * @typedef {{ [EngineName in 'npm' | 'node' | string]?: string }} Engines
 */
/**
 * Get the `engines.node` field of package.json.
 * @param {import('eslint').Rule.RuleContext} context The path to the current linting file.
 * @returns {import("semver").Range | undefined} The range object of the `engines.node` field.
 */
function getEnginesNode(context) {
    const filename = context.filename ?? context.getFilename()
    const info = getPackageJson(filename)
    if (
        info?.engines != null &&
        typeof info?.engines === "object" &&
        "node" in info.engines &&
        typeof info?.engines?.node === "string"
    ) {
        return getSemverRange(info.engines.node)
    }
}

/**
 * Gets version configuration.
 *
 * 1. Parse a given version then return it if it's valid.
 * 2. Look package.json up and parse `engines.node` then return it if it's valid.
 * 3. Return `>=16.0.0`.
 *
 * @param {import('eslint').Rule.RuleContext} context The version range text.
 * This will be used to look package.json up if `version` is not a valid version range.
 * @returns {import("semver").Range} The configured version range.
 */
module.exports = function getConfiguredNodeVersion(context) {
    return (
        getVersionRange(/** @type {VersionOption} */ (context.options?.[0])) ??
        getVersionRange(/** @type {VersionOption} */ (context.settings?.n)) ??
        getVersionRange(
            /** @type {VersionOption} */ (context.settings?.node)
        ) ??
        getEnginesNode(context) ??
        fallbackRange
    )
}

module.exports.schema = {
    type: "string",
}
