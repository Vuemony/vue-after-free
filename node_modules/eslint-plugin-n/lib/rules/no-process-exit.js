/**
 * @author Nicholas C. Zakas
 * See LICENSE file in root directory for full license.
 */
"use strict"

const querySelector = [
    `CallExpression > `,
    `MemberExpression.callee`,
    `[object.name="process"]`,
    `[property.name="exit"]`,
]

/** @type {import('./rule-module').RuleModule} */
module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "disallow the use of `process.exit()`",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-process-exit.md",
        },
        fixable: null,
        schema: [],
        messages: {
            noProcessExit: "Don't use process.exit(); throw an error instead.",
        },
    },

    create(context) {
        return {
            /** @param {import('estree').MemberExpression & { parent: import('estree').CallExpression}} node */
            [querySelector.join("")](node) {
                context.report({
                    node: node.parent,
                    messageId: "noProcessExit",
                })
            },
        }
    },
}
