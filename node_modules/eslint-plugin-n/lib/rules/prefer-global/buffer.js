/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { READ } = require("@eslint-community/eslint-utils")
const checkForPreferGlobal = require("../../util/check-prefer-global")

const traceMap = {
    globals: {
        Buffer: { [READ]: true },
    },
    modules: {
        buffer: { Buffer: { [READ]: true } },
        "node:buffer": { Buffer: { [READ]: true } },
    },
}

/** @type {import('../rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description:
                'enforce either `Buffer` or `require("buffer").Buffer`',
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/buffer.md",
        },
        type: "suggestion",
        fixable: null,
        schema: [{ enum: ["always", "never"] }],
        messages: {
            preferGlobal:
                "Unexpected use of 'require(\"buffer\").Buffer'. Use the global variable 'Buffer' instead.",
            preferModule:
                "Unexpected use of the global variable 'Buffer'. Use 'require(\"buffer\").Buffer' instead.",
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
