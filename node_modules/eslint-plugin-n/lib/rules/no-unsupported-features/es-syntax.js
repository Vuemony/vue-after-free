/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { getInnermostScope } = require("@eslint-community/eslint-utils")
const { rules: esRules } = require("eslint-plugin-es-x")
const rangeSubset = require("semver/ranges/subset")
const getConfiguredNodeVersion = require("../../util/get-configured-node-version")
const getSemverRange = require("../../util/get-semver-range")
const mergeVisitorsInPlace = require("../../util/merge-visitors-in-place")
const { getScope } = require("../../util/eslint-compat")
/** @type {Record<string, ESSyntax>} */
const features = require("./es-syntax.json")

/** @type {Set<string>} */
const ignoreKeys = new Set()

/**
 * @typedef ESSyntax
 * @property {string[]} [aliases]
 * @property {string | null} supported
 * @property {string} [strictMode]
 * @property {string} [deprecated]
 */
/**
 * @typedef RuleMap
 * @property {string} ruleId
 * @property {string} feature
 * @property {string[]} ignoreNames
 * @property {import("semver").Range} supported
 * @property {import("semver").Range} [strictMode]
 * @property {boolean} deprecated
 */

/**
 * @param {string} _match The entire match
 * @param {string} first The first regex group
 * @returns {string}
 */
function firstMatchToUpper(_match, first) {
    return first.toUpperCase()
}

/** @type {RuleMap[]} */
const ruleMap = Object.entries(features).map(([ruleId, meta]) => {
    const ruleIdNegated = ruleId.replace(/^no-/, "")
    const ruleIdCamel = ruleIdNegated.replace(/-(\w)/g, firstMatchToUpper)

    meta.aliases ??= []
    const ignoreNames = [ruleId, ruleIdNegated, ruleIdCamel, ...meta.aliases]

    for (const ignoreName of ignoreNames) {
        ignoreKeys.add(ignoreName)
    }

    const supported = getSemverRange(meta.supported ?? "<0")
    if (supported == null) {
        throw new Error(`Invalid semver Range: "${meta.supported}"`)
    }
    /** @type {RuleMap} */
    const rule = {
        ruleId: ruleId,
        feature: ruleIdNegated,
        ignoreNames: ignoreNames,
        supported: supported,
        deprecated: Boolean(meta.deprecated),
    }

    if (meta.strictMode) {
        const range = getSemverRange(meta.strictMode)
        if (range) {
            rule.strictMode = range
        }
    }

    return rule
})

/**
 * Parses the options.
 * @param {import('eslint').Rule.RuleContext} context The rule context.
 * @returns {{version: import('semver').Range,ignores:Set<string>}} Parsed value.
 */
function parseOptions(context) {
    /** @type {{ ignores?: string[] }} */
    const raw = context.options[0] || {}
    const version = getConfiguredNodeVersion(context)
    const ignores = new Set(raw.ignores || [])

    return Object.freeze({ version, ignores })
}

/**
 * Find the scope that a given node belongs to.
 * @param {import('eslint').Scope.Scope} initialScope The initial scope to find.
 * @param {import('estree').Node} node The AST node.
 * @returns {import('eslint').Scope.Scope} The scope that the node belongs to.
 */
function normalizeScope(initialScope, node) {
    let scope = getInnermostScope(initialScope, node)

    while (scope?.block === node && scope.upper) {
        scope = scope.upper
    }

    return scope
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').Node} node
 * @returns {boolean}
 */
function isStrict(context, node) {
    const scope = getScope(context)
    return normalizeScope(scope, node).isStrict
}

/**
 * Define the visitor object as merging the rules of eslint-plugin-es-x.
 * @param {import('eslint').Rule.RuleContext} context The rule context.
 * @param {ReturnType<parseOptions>} options The options.
 * @returns {object} The defined visitor.
 */
function defineVisitor(context, options) {
    return ruleMap
        .filter(
            rule =>
                rule.ignoreNames.every(
                    ignoreName => options.ignores.has(ignoreName) === false
                ) &&
                rangeSubset(
                    options.version,
                    rule.strictMode ?? rule.supported
                ) === false
        )
        .map(rule => {
            const esRule = /** @type {import('../rule-module').RuleModule} */ (
                esRules[rule.ruleId]
            )
            /** @type {Partial<import('eslint').Rule.RuleContext>} */
            const esContext = {
                report(descriptor) {
                    delete descriptor.fix

                    if (descriptor.data == null) {
                        descriptor.data = {}
                    }

                    descriptor.data.featureName = rule.feature
                    descriptor.data.version = options.version.raw
                    descriptor.data.supported = rule.supported.raw

                    if (rule.strictMode != null) {
                        if (
                            isStrict(
                                context,
                                /** @type {{ node: import('estree').Node}} */ (
                                    descriptor
                                ).node
                            ) === false
                        ) {
                            descriptor.data.supported = rule.strictMode.raw
                        } else if (
                            rangeSubset(options.version, rule.supported)
                        ) {
                            return
                        }
                    }

                    const messageId =
                        rule.supported.raw === "<0"
                            ? "not-supported-yet"
                            : "not-supported-till"

                    super.report({ ...descriptor, messageId })
                },
            }

            Object.setPrototypeOf(esContext, context)

            return esRule.create(
                /** @type {import('eslint').Rule.RuleContext} */ (esContext)
            )
        })
        .reduce(mergeVisitorsInPlace, {})
}

/** @type {import('../rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description:
                "disallow unsupported ECMAScript syntax on the specified version",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-syntax.md",
        },
        type: "problem",
        fixable: null,
        schema: [
            {
                type: "object",
                properties: {
                    version: getConfiguredNodeVersion.schema,
                    ignores: {
                        type: "array",
                        items: { enum: [...ignoreKeys] },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            "not-supported-till": [
                "'{{featureName}}' is not supported until Node.js {{supported}}.",
                "The configured version range is '{{version}}'.",
            ].join(" "),
            "not-supported-yet": [
                "'{{featureName}}' is not supported in Node.js.",
                "The configured version range is '{{version}}'.",
            ].join(" "),
        },
    },
    create(context) {
        return defineVisitor(context, parseOptions(context))
    },
}
