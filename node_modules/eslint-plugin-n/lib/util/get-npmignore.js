/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const fs = require("fs")
const path = require("path")
const ignore = require("ignore").default
const Cache = require("./cache")
const exists = require("./exists")
const { getPackageJson } = require("./get-package-json")

const cache = new Cache()
const PARENT_RELATIVE_PATH = /^\.\./u
const NEVER_IGNORED =
    /^(?:readme\.[^.]*|(?:licen[cs]e|changes|changelog|history)(?:\.[^.]*)?)$/iu

/**
 * Checks whether or not a given file name is a relative path to a ancestor
 * directory.
 *
 * @param {string} filePath - A file name to check.
 * @returns {boolean} `true` if the file name is a relative path to a ancestor
 *      directory.
 */
function isAncestorFiles(filePath) {
    return PARENT_RELATIVE_PATH.test(filePath)
}

/**
 * @param {(filePath: string) => boolean} f - A function.
 * @param {(filePath: string) => boolean} g - A function.
 * @returns {(filePath: string) => boolean} A logical-and function of `f` and `g`.
 */
function and(f, g) {
    return filePath => f(filePath) && g(filePath)
}

/**
 * @param {(filePath: string) => boolean} f - A function.
 * @param {(filePath: string) => boolean} g - A function.
 * @param {(filePath: string) => boolean} [h] - A function.
 * @returns {(filePath: string) => boolean} A logical-or function of `f`, `g`, and `h`.
 */
function or(f, g, h) {
    if (h == null) {
        return filePath => f(filePath) || g(filePath)
    }

    return filePath => f(filePath) || g(filePath) || h(filePath)
}

/**
 * @param {(filePath: string) => boolean} f - A function.
 * @returns {(filePath: string) => boolean} A logical-not function of `f`.
 */
function not(f) {
    return filePath => !f(filePath)
}

/**
 * Creates a function which checks whether or not a given file is ignoreable.
 *
 * @param {import('type-fest').JsonObject} packageJson - An object of package.json.
 * @returns {(filePath: string) => boolean} A function which checks whether or not a given file is ignoreable.
 */
function filterNeverIgnoredFiles(packageJson) {
    if (typeof packageJson?.filePath !== "string") {
        return () => false
    }

    const basedir = path.dirname(packageJson.filePath)
    const mainFilePath =
        typeof packageJson.main === "string"
            ? path.join(basedir, packageJson.main)
            : null

    return filePath =>
        path.join(basedir, filePath) !== mainFilePath &&
        filePath !== "package.json" &&
        !NEVER_IGNORED.test(path.relative(basedir, filePath))
}

/**
 * Creates a function which checks whether or not a given file should be ignored.
 *
 * @param {unknown} files - File names of whitelist.
 * @returns {((filePath: string) => boolean) | null} A function which checks whether or not a given file should be ignored.
 */
function parseWhiteList(files) {
    if (Array.isArray(files) === false) {
        return null
    }

    const ig = ignore()
    const igN = ignore()
    let hasN = false

    for (const file of files) {
        if (typeof file === "string" && file) {
            const body = path.posix
                .normalize(file.replace(/^!/u, ""))
                .replace(/\/+$/u, "")

            if (file.startsWith("!")) {
                igN.add(`${body}`)
                igN.add(`${body}/**`)
                hasN = true
            } else {
                ig.add(`/${body}`)
                ig.add(`/${body}/**`)
            }
        }
    }

    return hasN
        ? or(ig.createFilter(), not(igN.createFilter()))
        : ig.createFilter()
}

/**
 * Creates a function which checks whether or not a given file should be ignored.
 *
 * @param {string} basedir - The directory path "package.json" exists.
 * @param {boolean} filesFieldExists - `true` if `files` field of `package.json` exists.
 * @returns {((filePath: string) => boolean)|null} A function which checks whether or not a given file should be ignored.
 */
function parseNpmignore(basedir, filesFieldExists) {
    let filePath = path.join(basedir, ".npmignore")
    if (!exists(filePath)) {
        if (filesFieldExists) {
            return null
        }

        filePath = path.join(basedir, ".gitignore")
        if (!exists(filePath)) {
            return null
        }
    }

    const ig = ignore()
    ig.add(fs.readFileSync(filePath, "utf8"))
    return not(ig.createFilter())
}

/**
 * Gets an object to check whether a given path should be ignored or not.
 * The object is created from:
 *
 * - `files` field of `package.json`
 * - `.npmignore`
 *
 * @param {string} startPath - A file path to lookup.
 * @returns {{ match: (filePath: string) => boolean }}
 *      An object to check whther or not a given path should be ignored.
 *      The object has a method `match`.
 *      `match` returns `true` if a given file path should be ignored.
 */
module.exports = function getNpmignore(startPath) {
    const retv = { match: isAncestorFiles }

    const packageJson = getPackageJson(startPath)
    if (typeof packageJson?.filePath !== "string") {
        return retv
    }

    const data = cache.get(packageJson.filePath)
    if (data) {
        return data
    }

    const filesIgnore = parseWhiteList(packageJson.files)

    const npmignoreIgnore = parseNpmignore(
        path.dirname(packageJson.filePath),
        Boolean(filesIgnore)
    )

    if (filesIgnore && npmignoreIgnore) {
        retv.match = and(
            filterNeverIgnoredFiles(packageJson),
            or(isAncestorFiles, filesIgnore, npmignoreIgnore)
        )
    } else if (filesIgnore) {
        retv.match = and(
            filterNeverIgnoredFiles(packageJson),
            or(isAncestorFiles, filesIgnore)
        )
    } else if (npmignoreIgnore) {
        retv.match = and(
            filterNeverIgnoredFiles(packageJson),
            or(isAncestorFiles, npmignoreIgnore)
        )
    }

    cache.set(packageJson.filePath, retv)

    return retv
}
