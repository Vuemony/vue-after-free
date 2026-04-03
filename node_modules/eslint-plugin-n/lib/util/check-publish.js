/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const path = require("path")
const getAllowModules = require("./get-allow-modules")
const getConvertPath = require("./get-convert-path")
const getNpmignore = require("./get-npmignore")
const { getPackageJson } = require("./get-package-json")

/**
 * Checks whether or not each requirement target is published via package.json.
 *
 * It reads package.json and checks the target exists in `dependencies`.
 *
 * @param {import('eslint').Rule.RuleContext} context - A context to report.
 * @param {string} filePath - The current file path.
 * @param {import('./import-target.js')[]} targets - A list of target information to check.
 * @param {{ignorePrivate: boolean}} options - Configuration options for checking for published files.
 * @returns {void}
 */
exports.checkPublish = function checkPublish(
    context,
    filePath,
    targets,
    options
) {
    const packageJson = getPackageJson(filePath)
    if (typeof packageJson?.filePath !== "string") {
        return
    }

    // Flag to ignore checking imported dependencies in private packages.
    // For projects that need to be deployed to a server checking for imported dependencies may still be desireable
    // while making it a private package.
    // More information: https://docs.npmjs.com/cli/v8/configuring-npm/package-json#private
    if (options.ignorePrivate && packageJson.private === true) {
        return
    }

    const allowed = new Set(getAllowModules(context))
    const convertPath = getConvertPath(context)
    const basedir = path.dirname(packageJson.filePath)

    /** @type {(fullPath: string) => string} */
    const toRelative = fullPath => {
        const retv = path.relative(basedir, fullPath).replace(/\\/gu, "/")
        return convertPath(retv)
    }
    const npmignore = getNpmignore(filePath)
    const devDependencies = new Set(
        Object.keys(packageJson.devDependencies ?? {})
    )
    const dependencies = new Set([
        ...Object.keys(packageJson?.dependencies ?? {}),
        ...Object.keys(packageJson?.peerDependencies ?? {}),
        ...Object.keys(packageJson?.optionalDependencies ?? {}),
    ])

    if (!npmignore.match(toRelative(filePath))) {
        // This file is published, so this cannot import private files.
        for (const target of targets) {
            const isPrivateFile = () => {
                if (target.moduleName != null) {
                    return false
                }
                const relativeTargetPath = toRelative(target.filePath ?? "")
                return (
                    relativeTargetPath !== "" &&
                    npmignore.match(relativeTargetPath)
                )
            }
            const isDevPackage = () =>
                target.moduleName != null &&
                devDependencies.has(target.moduleName) &&
                !dependencies.has(target.moduleName) &&
                !allowed.has(target.moduleName)

            if (isPrivateFile() || isDevPackage()) {
                context.report({
                    node: target.node,
                    messageId: "notPublished",
                    data: { name: target.moduleName || target.name },
                })
            }
        }
    }
}

exports.messages = {
    notPublished: '"{{name}}" is not published.',
}
