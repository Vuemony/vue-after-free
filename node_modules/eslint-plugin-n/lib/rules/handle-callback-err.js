/**
 * @author Jamund Ferguson
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { getScope } = require("../util/eslint-compat")

/**
 * @typedef {[string?]} RuleOptions
 */
/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        type: "suggestion",
        docs: {
            description: "require error handling in callbacks",
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/handle-callback-err.md",
        },
        fixable: null,
        schema: [
            {
                type: "string",
            },
        ],
        messages: {
            expected: "Expected error to be handled.",
        },
    },

    create(context) {
        const errorArgument = context.options[0] || "err"

        /**
         * Checks if the given argument should be interpreted as a regexp pattern.
         * @param {string} stringToCheck The string which should be checked.
         * @returns {boolean} Whether or not the string should be interpreted as a pattern.
         */
        function isPattern(stringToCheck) {
            const firstChar = stringToCheck[0]

            return firstChar === "^"
        }

        /**
         * Checks if the given name matches the configured error argument.
         * @param {string} name The name which should be compared.
         * @returns {boolean} Whether or not the given name matches the configured error variable name.
         */
        function matchesConfiguredErrorName(name) {
            if (isPattern(errorArgument)) {
                const regexp = new RegExp(errorArgument, "u")

                return regexp.test(name)
            }
            return name === errorArgument
        }

        /**
         * Get the parameters of a given function scope.
         * @param {import('eslint').Scope.Scope} scope The function scope.
         * @returns {import('eslint').Scope.Variable[]} All parameters of the given scope.
         */
        function getParameters(scope) {
            return scope.variables.filter(
                variable =>
                    variable.defs[0] && variable.defs[0].type === "Parameter"
            )
        }

        /**
         * Check to see if we're handling the error object properly.
         * @param {import('estree').Node} node The AST node to check.
         * @returns {void}
         */
        function checkForError(node) {
            const scope = getScope(context, node)
            const parameters = getParameters(scope)
            const firstParameter = parameters[0]

            if (
                firstParameter &&
                matchesConfiguredErrorName(firstParameter.name)
            ) {
                if (firstParameter.references.length === 0) {
                    context.report({ node, messageId: "expected" })
                }
            }
        }

        return {
            FunctionDeclaration: checkForError,
            FunctionExpression: checkForError,
            ArrowFunctionExpression: checkForError,
        }
    },
}
