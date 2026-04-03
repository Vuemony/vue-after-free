/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { rsort } = require("semver")
const { ReferenceTracker } = require("@eslint-community/eslint-utils")
const getConfiguredNodeVersion = require("./get-configured-node-version")
const getSemverRange = require("./get-semver-range")
const unprefixNodeColon = require("./unprefix-node-colon")
const semverRangeSubset = require("semver/ranges/subset")
const { getScope } = require("../util/eslint-compat")
const {
    iterateProcessGetBuiltinModuleReferences,
} = require("./iterate-process-get-builtin-module-references")

/**
 * Parses the options.
 * @param {import('eslint').Rule.RuleContext} context The rule context.
 * @returns {Readonly<{
 *   version: import('semver').Range;
 *   ignores: Set<string>;
 *   allowExperimental: boolean;
 * }>} Parsed value.
 */
function parseOptions(context) {
    const raw = /** @type {{
     *   ignores?: string[];
     *   allowExperimental?: boolean;
     * }} */ (context.options[0] || {})
    const version = getConfiguredNodeVersion(context)
    const ignores = new Set(raw.ignores || [])
    const allowExperimental = raw.allowExperimental ?? false

    return Object.freeze({ version, ignores, allowExperimental })
}

/**
 * Check if it has been supported.
 * @param {string[] | undefined} featureRange The target features supported range
 * @param {import('semver').Range} requestedRange The configured version range.
 * @returns {boolean}
 */
function isInRange(featureRange, requestedRange) {
    if (featureRange == null || featureRange.length === 0) {
        return false
    }

    const [latest] = rsort(featureRange)
    const range = getSemverRange(
        [...featureRange.map(version => `^${version}`), `>= ${latest}`].join(
            "||"
        )
    )

    if (range == null) {
        return false
    }

    return semverRangeSubset(requestedRange, range)
}

/**
 * Get the formatted text of a given supported version.
 * @param {string[] | undefined} versions The support info.
 * @returns {string | undefined}
 */
function versionsToString(versions) {
    if (versions == null) {
        return
    }

    const [latest, ...backported] = rsort(versions)

    if (backported.length === 0) {
        return latest
    }

    const backportString = backported.map(version => `^${version}`).join(", ")

    return `${latest} (backported: ${backportString})`
}

/**
 * Verify the code to report unsupported API references.
 * @param {import('eslint').Rule.RuleContext} context The rule context.
 * @param {import("@eslint-community/eslint-utils").Reference<import("../unsupported-features/types.js").SupportInfo>[]} references The references for APIs to report.
 * @returns {void}
 */
function checkUnsupportedBuiltinReferences(context, references) {
    const options = parseOptions(context)

    for (const { node, path, info } of references) {
        const name = unprefixNodeColon(path.join("."))

        if (options.ignores.has(name)) {
            continue
        }

        if (options.allowExperimental) {
            if (isInRange(info.experimental, options.version)) {
                continue
            }

            const experimentalVersion = versionsToString(info.experimental)
            if (experimentalVersion) {
                context.report({
                    node,
                    messageId: "not-experimental-till",
                    data: {
                        name: name,
                        experimental: experimentalVersion,
                        version: options.version.raw,
                    },
                })
                continue
            }
        }

        if (isInRange(info.supported, options.version)) {
            continue
        }

        const supportedVersion = versionsToString(info.supported)
        if (supportedVersion) {
            context.report({
                node,
                messageId: "not-supported-till",
                data: {
                    name: name,
                    supported: supportedVersion,
                    version: options.version.raw,
                },
            })
            continue
        }

        context.report({
            node,
            messageId: "not-supported-yet",
            data: {
                name: name,
                version: options.version.raw,
            },
        })
    }
}

/**
 * Verify the code to report unsupported APIs.
 * @param {import('eslint').Rule.RuleContext} context The rule context.
 * @param {import('../unsupported-features/types.js').SupportVersionBuiltins} traceMap The map for APIs to report.
 * @returns {void}
 */
module.exports.checkUnsupportedBuiltins = function checkUnsupportedBuiltins(
    context,
    traceMap
) {
    const scope = getScope(context)
    const tracker = new ReferenceTracker(scope, { mode: "legacy" })
    const references = [
        ...tracker.iterateCjsReferences(traceMap.modules ?? {}),
        ...iterateProcessGetBuiltinModuleReferences(
            tracker,
            traceMap.modules ?? {}
        ),
        ...tracker.iterateEsmReferences(traceMap.modules ?? {}),
        ...tracker.iterateGlobalReferences(traceMap.globals ?? {}),
    ]

    checkUnsupportedBuiltinReferences(context, references)
}

module.exports.checkUnsupportedBuiltinReferences =
    checkUnsupportedBuiltinReferences

exports.messages = {
    "not-experimental-till": [
        "The '{{name}}' is not an experimental feature",
        "until Node.js {{experimental}}.",
        "The configured version range is '{{version}}'.",
    ].join(" "),
    "not-supported-till": [
        "The '{{name}}' is still an experimental feature",
        "and is not supported until Node.js {{supported}}.",
        "The configured version range is '{{version}}'.",
    ].join(" "),
    "not-supported-yet": [
        "The '{{name}}' is still an experimental feature",
        "The configured version range is '{{version}}'.",
    ].join(" "),
}
