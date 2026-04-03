/**
 * @author Pixel998
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { READ } = require("@eslint-community/eslint-utils")
const checkForPreferGlobal = require("../../util/check-prefer-global")

const traceMap = {
    globals: {
        crypto: { [READ]: true },
    },
    modules: {
        crypto: { webcrypto: { [READ]: true } },
        "node:crypto": { webcrypto: { [READ]: true } },
    },
}

/** @type {import('../rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description:
                'enforce either `crypto` or `require("crypto").webcrypto`',
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/crypto.md",
        },
        type: "suggestion",
        fixable: null,
        schema: [{ enum: ["always", "never"] }],
        messages: {
            preferGlobal:
                "Unexpected use of 'require(\"crypto\").webcrypto'. Use the global variable 'crypto' instead.",
            preferModule:
                "Unexpected use of the global variable 'crypto'. Use 'require(\"crypto\").webcrypto' instead.",
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
