/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const path = require("path")
const globrex = require("globrex")

/** @typedef {import("../util/import-target")} ImportTarget */
/**
 * @typedef DefinitionData
 * @property {string | string[]} name The name to disallow.
 * @property {string} [message] The custom message to show.
 */

/**
 * Check if matched or not.
 * @param {globrex.Results} matcher The globrex "matcher".
 * @param {boolean} absolute The flag that the matcher is for absolute paths.
 * @param {import('./import-target.js')} importee The importee information.
 */
function match(matcher, absolute, { filePath, name }) {
    if (absolute) {
        return filePath != null && matcher.regex.test(filePath)
    }
    return matcher.regex.test(name)
}

/** Restriction. */
class Restriction {
    /**
     * Initialize this restriction.
     * @param {DefinitionData} def The definition of a restriction.
     */
    constructor({ name, message }) {
        const names = Array.isArray(name) ? name : [name]
        const matchers = names.map(raw => {
            const negate = raw[0] === "!" && raw[1] !== "("
            const pattern = negate ? raw.slice(1) : raw
            const absolute = path.isAbsolute(pattern)

            const matcher = globrex(pattern, { globstar: true })
            return { absolute, matcher, negate }
        })

        this.matchers = matchers
        this.message = message ? ` ${message}` : ""
    }

    /**
     * Check if a given importee is disallowed.
     * @param {import('./import-target.js')} importee The importee to check.
     * @returns {boolean} `true` if the importee is disallowed.
     */
    match(importee) {
        return this.matchers.reduce(
            (ret, { absolute, matcher, negate }) =>
                negate
                    ? ret && !match(matcher, absolute, importee)
                    : ret || match(matcher, absolute, importee),
            false
        )
    }
}

/**
 * Create a restriction.
 * @param {string | DefinitionData} def A definition.
 * @returns {Restriction} Created restriction.
 */
function createRestriction(def) {
    if (typeof def === "string") {
        return new Restriction({ name: def })
    }
    return new Restriction(def)
}

/**
 * Create restrictions.
 * @param {(string | DefinitionData)[]} defs Definitions.
 * @returns {(Restriction)[]} Created restrictions.
 */
function createRestrictions(defs) {
    return (defs || []).map(createRestriction)
}

/**
 * Checks if given importees are disallowed or not.
 * @param {import('eslint').Rule.RuleContext} context - A context to report.
 * @param {import('./import-target.js')[]} targets - A list of target information to check.
 * @returns {void}
 */
exports.checkForRestriction = function checkForRestriction(context, targets) {
    const restrictions = createRestrictions(
        /** @type {string[]} */ (context.options[0])
    )

    for (const target of targets) {
        const restriction = restrictions.find(r => r.match(target))
        if (restriction) {
            context.report({
                node: target.node,
                messageId: "restricted",
                data: {
                    name: target.name,
                    customMessage: restriction.message,
                },
            })
        }
    }
}

exports.messages = {
    restricted:
        "'{{name}}' module is restricted from being used.{{customMessage}}",
}
