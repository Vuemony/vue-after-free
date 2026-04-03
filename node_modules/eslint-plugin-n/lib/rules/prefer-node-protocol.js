/**
 * @author Yusuke Iinuma
 * See LICENSE file in root directory for full license.
 */
"use strict"

const {
    getStringIfConstant,
    getPropertyName,
} = require("@eslint-community/eslint-utils")

const { subset, Range } = require("semver")

const getConfiguredNodeVersion = require("../util/get-configured-node-version")
const stripImportPathParams = require("../util/strip-import-path-params")

const {
    NodeBuiltinModules,
} = require("../unsupported-features/node-builtins.js")

/**
 * @typedef { 'import' | 'require' | 'getBuiltinModule' } ModuleStyle
 */

/**
 * @param {string} name The name of the node module
 * @returns {boolean}
 */
function isBuiltin(name) {
    return Object.hasOwn(NodeBuiltinModules, name)
}

const messageId = "preferNodeProtocol"

const supportedRangeForEsm = new Range("^12.20.0 || >= 14.13.1")
const supportedRangeForCjs = new Range("^14.18.0 || >= 16.0.0")

/**
 * @param {import('estree').Node} [node]
 * @returns {node is import('estree').Literal}
 */
function isStringLiteral(node) {
    return node?.type === "Literal" && typeof node.type === "string"
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {ModuleStyle} moduleStyle
 * @returns {boolean}
 */
function isEnablingThisRule(context, moduleStyle) {
    // The availability of `process.getBuiltinModule()` means that `node:` protocol is supported.
    if (moduleStyle === "getBuiltinModule") {
        return true
    }

    const version = getConfiguredNodeVersion(context)

    // Only check Node.js version because this rule is meaningless if configured Node.js version doesn't match semver range.
    if (!subset(version, supportedRangeForEsm)) {
        return false
    }

    // Only check when using `require`
    if (moduleStyle === "require" && !subset(version, supportedRangeForCjs)) {
        return false
    }

    return true
}

/**
 * @param {import('estree').Node} node
 * @returns {boolean}
 **/
function isValidRequireArgument(node) {
    const rawName = getStringIfConstant(node)
    if (typeof rawName !== "string") {
        return false
    }

    const name = stripImportPathParams(rawName)
    if (!isBuiltin(name)) {
        return false
    }

    return true
}

/**
 * @param {import('estree').Node | null | undefined} node
 * @param {import('eslint').Rule.RuleContext} context
 * @param {ModuleStyle} moduleStyle
 */
function validate(node, context, moduleStyle) {
    if (node == null) {
        return
    }

    if (!isEnablingThisRule(context, moduleStyle)) {
        return
    }

    if (!isStringLiteral(node)) {
        return
    }

    if (
        (moduleStyle === "require" || moduleStyle === "getBuiltinModule") &&
        !isValidRequireArgument(node)
    ) {
        return
    }

    if (
        !("value" in node) ||
        typeof node.value !== "string" ||
        node.value.startsWith("node:") ||
        !isBuiltin(node.value) ||
        !isBuiltin(`node:${node.value}`)
    ) {
        return
    }

    context.report({
        node,
        messageId,
        data: {
            moduleName: node.value,
        },
        fix(fixer) {
            const firstCharacterIndex = (node?.range?.[0] ?? 0) + 1
            return fixer.replaceTextRange(
                [firstCharacterIndex, firstCharacterIndex],
                "node:"
            )
        },
    })
}

/**
 * @param {import('estree').Expression | import('estree').Super} node
 */
function isProcess(node) {
    if (node.type === "Identifier" && node.name === "process") {
        return true
    }
    if (node.type === "MemberExpression") {
        if (getPropertyName(node) !== "process") {
            return false
        }
        return (
            node.object.type === "Identifier" &&
            node.object.name === "globalThis"
        )
    }
    return false
}

/** @type {import('./rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description:
                "enforce using the `node:` protocol when importing Node.js builtin modules.",
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-node-protocol.md",
        },
        fixable: "code",
        messages: {
            [messageId]: "Prefer `node:{{moduleName}}` over `{{moduleName}}`.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    version: getConfiguredNodeVersion.schema,
                },
                additionalProperties: false,
            },
        ],
        type: "suggestion",
    },
    create(context) {
        return {
            CallExpression(node) {
                if (node.type !== "CallExpression") {
                    return
                }

                if (
                    !node.optional &&
                    node.arguments.length === 1 &&
                    node.callee.type === "Identifier" &&
                    node.callee.name === "require"
                ) {
                    return validate(node.arguments[0], context, "require")
                }
                if (
                    node.arguments.length >= 1 &&
                    node.callee.type === "MemberExpression" &&
                    isProcess(node.callee.object) &&
                    getPropertyName(node.callee) === "getBuiltinModule"
                ) {
                    return validate(
                        node.arguments[0],
                        context,
                        "getBuiltinModule"
                    )
                }
            },

            ExportAllDeclaration(node) {
                return validate(node.source, context, "import")
            },
            ExportNamedDeclaration(node) {
                return validate(node.source, context, "import")
            },
            ImportDeclaration(node) {
                return validate(node.source, context, "import")
            },
            ImportExpression(node) {
                return validate(node.source, context, "import")
            },
        }
    },
}
