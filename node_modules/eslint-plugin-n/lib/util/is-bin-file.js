"use strict"

const path = require("path")

/**
 * @param {string} filePath
 * @param {string} binField
 * @returns {boolean}
 */
function simulateNodeResolutionAlgorithm(filePath, binField) {
    const possibilities = [filePath]
    let newFilePath = filePath.replace(/\.js$/u, "")
    possibilities.push(newFilePath)
    newFilePath = newFilePath.replace(/[/\\]index$/u, "")
    possibilities.push(newFilePath)
    return possibilities.includes(binField)
}

/**
 * Checks whether or not a given path is a `bin` file.
 *
 * @param {string} filePath - A file path to check.
 * @param {unknown} binField - A value of the `bin` field of `package.json`.
 * @param {string} basedir - A directory path that `package.json` exists.
 * @returns {boolean} `true` if the file is a `bin` file.
 */
function isBinFile(filePath, binField, basedir) {
    if (!binField) {
        return false
    }

    if (typeof binField === "string") {
        return simulateNodeResolutionAlgorithm(
            filePath,
            path.resolve(basedir, binField)
        )
    }

    if (binField instanceof Object === false) {
        return false
    }

    for (const value of Object.values(binField)) {
        const resolvedPath = path.resolve(basedir, value)
        if (simulateNodeResolutionAlgorithm(filePath, resolvedPath)) {
            return true
        }
    }

    return false
}

module.exports = { isBinFile }
