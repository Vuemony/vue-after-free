/**
 * @author Jamund Ferguson
 * See LICENSE file in root directory for full license.
 */
"use strict"
const { getSourceCode } = require("../util/eslint-compat")

/**
 * @typedef {[string[]?]} RuleOptions
 */
/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "require `return` statements after callbacks",
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/callback-return.md",
        },
        schema: [
            {
                type: "array",
                items: { type: "string" },
            },
        ],
        fixable: null,
        messages: {
            missingReturn: "Expected return with your callback function.",
        },
    },

    create(context) {
        const callbacks = context.options[0] || ["callback", "cb", "next"]
        const sourceCode = getSourceCode(context)

        /**
         * Find the closest parent matching a list of types.
         * @param {import('eslint').Rule.Node} node The node whose parents we are searching
         * @param {string[]} types The node types to match
         * @returns {import('eslint').Rule.Node | null} The matched node or undefined.
         */
        function findClosestParentOfType(node, types) {
            if (!node.parent) {
                return null
            }
            if (types.indexOf(node.parent.type) === -1) {
                return findClosestParentOfType(node.parent, types)
            }
            return node.parent
        }

        /**
         * Check to see if a node contains only identifers
         * @param {import('estree').Expression | import('estree').Super} node The node to check
         * @returns {boolean} Whether or not the node contains only identifers
         */
        function containsOnlyIdentifiers(node) {
            if (node.type === "Identifier") {
                return true
            }

            if (node.type === "MemberExpression") {
                if (node.object.type === "Identifier") {
                    return true
                }
                if (node.object.type === "MemberExpression") {
                    return containsOnlyIdentifiers(node.object)
                }
            }

            return false
        }

        /**
         * Check to see if a CallExpression is in our callback list.
         * @param {import('estree').CallExpression} node The node to check against our callback names list.
         * @returns {boolean} Whether or not this function matches our callback name.
         */
        function isCallback(node) {
            return (
                containsOnlyIdentifiers(node.callee) &&
                callbacks.indexOf(sourceCode.getText(node.callee)) > -1
            )
        }

        /**
         * Determines whether or not the callback is part of a callback expression.
         * @param {import('eslint').Rule.Node} node The callback node
         * @param {import('estree').Statement} [parentNode] The expression node
         * @returns {boolean} Whether or not this is part of a callback expression
         */
        function isCallbackExpression(node, parentNode) {
            // ensure the parent node exists and is an expression
            if (!parentNode || parentNode.type !== "ExpressionStatement") {
                return false
            }

            // cb()
            if (parentNode.expression === node) {
                return true
            }

            // special case for cb && cb() and similar
            if (
                parentNode.expression.type === "BinaryExpression" ||
                parentNode.expression.type === "LogicalExpression"
            ) {
                if (parentNode.expression.right === node) {
                    return true
                }
            }

            return false
        }

        return {
            CallExpression(node) {
                // if we're not a callback we can return
                if (!isCallback(node)) {
                    return
                }

                // find the closest block, return or loop
                const closestBlock = findClosestParentOfType(node, [
                    "BlockStatement",
                    "ReturnStatement",
                    "ArrowFunctionExpression",
                ])

                // if our parent is a return we know we're ok
                if (closestBlock?.type === "ReturnStatement") {
                    return
                }

                // arrow functions don't always have blocks and implicitly return
                if (closestBlock?.type === "ArrowFunctionExpression") {
                    return
                }

                // block statements are part of functions and most if statements
                if (closestBlock?.type === "BlockStatement") {
                    // find the last item in the block
                    const lastItem = closestBlock.body.at(-1)

                    // if the callback is the last thing in a block that might be ok
                    if (isCallbackExpression(node, lastItem)) {
                        const parentType = closestBlock.parent.type

                        // but only if the block is part of a function
                        if (
                            parentType === "FunctionExpression" ||
                            parentType === "FunctionDeclaration" ||
                            parentType === "ArrowFunctionExpression"
                        ) {
                            return
                        }
                    }

                    // ending a block with a return is also ok
                    if (lastItem?.type === "ReturnStatement") {
                        // but only if the callback is immediately before
                        if (
                            isCallbackExpression(node, closestBlock.body.at(-2))
                        ) {
                            return
                        }
                    }
                }

                // as long as you're the child of a function at this point you should be asked to return
                if (
                    findClosestParentOfType(node, [
                        "FunctionDeclaration",
                        "FunctionExpression",
                        "ArrowFunctionExpression",
                    ])
                ) {
                    context.report({ node, messageId: "missingReturn" })
                }
            },
        }
    },
}
