/**
 * @fileoverview Utilities for eslint compatibility.
 * @see https://eslint.org/docs/latest/use/migrate-to-9.0.0#removed-context-methods
 * @author aladdin-add<weiran.zsd@outlook.com>
 */
"use strict"

/** @import { Rule } from 'eslint' */
/** @typedef {import('estree').Node} Node */

exports.getSourceCode = function (/** @type Rule.RuleContext */ context) {
    return context.sourceCode || context.getSourceCode()
}

exports.getScope = function (
    /** @type {Rule.RuleContext} */ context,
    /** @type {Node} */ node
) {
    const sourceCode = exports.getSourceCode(context)
    // @ts-ignore
    return sourceCode.getScope?.(node || sourceCode.ast) || context.getScope()
}

exports.getAncestors = function (
    /** @type {Rule.RuleContext} */ context,
    /** @type {Node} */ node
) {
    const sourceCode = exports.getSourceCode(context)
    // @ts-ignore
    return sourceCode.getAncestors?.(node) || context.getAncestors()
}

exports.getCwd = function (/** @type {Rule.RuleContext} */ context) {
    return context.cwd || context.getCwd()
}

exports.getPhysicalFilename = function (
    /** @type {Rule.RuleContext} */ context
) {
    return context.physicalFilename || context.getPhysicalFilename?.()
}

exports.getFilename = function (/** @type {Rule.RuleContext} */ context) {
    return context.filename || context.getFilename?.()
}
