/**
 * @author Pixel998
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { READ } = require("@eslint-community/eslint-utils")
const checkForPreferGlobal = require("../../util/check-prefer-global")

const traceMap = {
    globals: {
        clearImmediate: { [READ]: true },
        clearInterval: { [READ]: true },
        clearTimeout: { [READ]: true },
        setImmediate: { [READ]: true },
        setInterval: { [READ]: true },
        setTimeout: { [READ]: true },
    },
    modules: {
        timers: {
            clearImmediate: { [READ]: true },
            clearInterval: { [READ]: true },
            clearTimeout: { [READ]: true },
            setImmediate: { [READ]: true },
            setInterval: { [READ]: true },
            setTimeout: { [READ]: true },
        },
        "node:timers": {
            clearImmediate: { [READ]: true },
            clearInterval: { [READ]: true },
            clearTimeout: { [READ]: true },
            setImmediate: { [READ]: true },
            setInterval: { [READ]: true },
            setTimeout: { [READ]: true },
        },
    },
}

/** @type {import('../rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description:
                'enforce either global timer functions or `require("timers")`',
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/timers.md",
        },
        type: "suggestion",
        fixable: null,
        schema: [{ enum: ["always", "never"] }],
        messages: {
            preferGlobal:
                "Unexpected use of 'require(\"timers\").*'. Use the global variable instead.",
            preferModule:
                "Unexpected use of the global variable. Use 'require(\"timers\").*' instead.",
        },
    },

    create(context) {
        return {
            "Program:exit"() {
                checkForPreferGlobal(context, traceMap)
            },
        }
    },
}
