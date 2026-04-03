"use strict"

const path = require("path")
const isTypescript = require("./is-typescript")
const getTypescriptExtensionMap = require("./get-typescript-extension-map")

/**
 * Maps the typescript file extension that should be added in an import statement,
 * based on the given file extension of the referenced file OR fallsback to the original given extension.
 *
 * For example, in typescript, when referencing another typescript from a typescript file,
 * a .js extension should be used instead of the original .ts extension of the referenced file.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @param {string} filePath The filePath of the import
 * @param {string} fallbackExtension The non-typescript fallback
 * @returns {string} The file extension to append to the import statement.
 */
function convertTsExtensionToJs(context, filePath, fallbackExtension) {
    const { forward } = getTypescriptExtensionMap(context)
    const ext = path.extname(filePath)

    if (
        isTypescript(context) &&
        ext in forward &&
        Object.hasOwn(forward, ext) &&
        typeof forward[ext] === "string"
    ) {
        return forward[ext]
    }

    return fallbackExtension
}

/**
 * Maps the typescript file extension that should be added in an import statement,
 * based on the given file extension of the referenced file OR fallsback to the original given extension.
 *
 * For example, in typescript, when referencing another typescript from a typescript file,
 * a .js extension should be used instead of the original .ts extension of the referenced file.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @param {string} filePath The filePath of the import
 * @param {string} fallbackExtension The non-typescript fallback
 * @returns {string[]} The file extension to append to the import statement.
 */
function convertJsExtensionToTs(context, filePath, fallbackExtension) {
    const { backward } = getTypescriptExtensionMap(context)
    const ext = path.extname(filePath)

    if (
        isTypescript(context) &&
        ext in backward &&
        Object.hasOwn(backward, ext) &&
        Array.isArray(backward[ext])
    ) {
        return backward[ext]
    }

    return [fallbackExtension]
}

module.exports = {
    convertTsExtensionToJs,
    convertJsExtensionToTs,
}
