"use strict"

const path = require("path")
const { getPhysicalFilename, getFilename } = require("./eslint-compat")

const typescriptExtensions = [".ts", ".tsx", ".cts", ".mts"]

/**
 * Determine if the context source file is typescript.
 *
 * @param {import('eslint').Rule.RuleContext} context - A context
 * @returns {boolean}
 */
module.exports = function isTypescript(context) {
    const sourceFileExt = path.extname(
        getPhysicalFilename(context) ?? getFilename(context)
    )
    return typescriptExtensions.includes(sourceFileExt)
}
