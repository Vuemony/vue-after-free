/**
 * @author Vignesh Anand
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const querySelector = [
    `MemberExpression`,
    `[computed!=true]`,
    `[object.name="process"]`,
    `[property.name="env"]`,
    `,`,
    `MemberExpression`,
    `[computed=true]`,
    `[object.name="process"]`,
    `[property.value="env"]`,
]

/**
 * @param {unknown} node  [description]
 * @returns {node is import('estree').MemberExpression}
 */
function isMemberExpresion(node) {
    return (
        node != null &&
        typeof node === "object" &&
        "type" in node &&
        node.type === "MemberExpression"
    )
}

/**
 * @typedef {[
 *   {
 *     allowedVariables?: string[]
 *   }?
 * ]} RuleOptions
 */
/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "disallow the use of `process.env`",
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-process-env.md",
        },
        fixable: null,
        schema: [
            {
                type: "object",
                properties: {
                    allowedVariables: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpectedProcessEnv: "Unexpected use of process.env.",
        },
    },

    create(context) {
        const options = context.options[0] ?? {}
        /** @type {string[]} */
        const allowedVariables = options.allowedVariables ?? []
        return {
            /** @param {import('estree').MemberExpression} node */
            [querySelector.join("")](node) {
                if (
                    "parent" in node &&
                    isMemberExpresion(node.parent) &&
                    node.parent.property != null
                ) {
                    const child = node.parent.property
                    if (
                        (child.type === "Identifier" &&
                            node.parent.computed === false &&
                            allowedVariables.includes(child.name)) ||
                        (child.type === "Literal" &&
                            typeof child.value === "string" &&
                            node.parent.computed === true &&
                            allowedVariables.includes(child.value))
                    ) {
                        return
                    }
                }
                context.report({ node, messageId: "unexpectedProcessEnv" })
            },
        }
    },
}
