/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const path = require("path")
const {
    CALL,
    ReferenceTracker,
    getStringIfConstant,
} = require("@eslint-community/eslint-utils")
const { isBuiltin } = require("node:module")
const getResolvePaths = require("./get-resolve-paths")
const getResolverConfig = require("./get-resolver-config")
const getTryExtensions = require("./get-try-extensions")
const ImportTarget = require("./import-target")
const stripImportPathParams = require("./strip-import-path-params")
const { getScope, getFilename } = require("../util/eslint-compat")

/**
 * @typedef VisitRequireOptions
 * @property {boolean} [includeCore=false] The flag to include core modules.
 */

/**
 * Gets a list of `require()` targets.
 *
 * Core modules of Node.js (e.g. `fs`, `http`) are excluded.
 *
 * @param {import('eslint').Rule.RuleContext} context - The rule context.
 * @param {VisitRequireOptions} options - The flag to include core modules.
 * @param {function(ImportTarget[]): void} callback The callback function to get result.
 * @returns {import('eslint').Rule.RuleListener} The visitor.
 */
module.exports = function visitRequire(
    context,
    { includeCore = false },
    callback
) {
    /** @type {import('./import-target.js')[]} */
    const targets = []
    const basedir = path.dirname(path.resolve(getFilename(context)))
    const paths = getResolvePaths(context)
    const resolverConfig = getResolverConfig(context)
    const extensions = getTryExtensions(context)
    const options = { basedir, paths, extensions, resolverConfig }

    return {
        "Program:exit"() {
            const tracker = new ReferenceTracker(getScope(context))
            const references = tracker.iterateGlobalReferences({
                require: {
                    [CALL]: true,
                    resolve: { [CALL]: true },
                },
            })

            for (const { node } of references) {
                if (node.type !== "CallExpression") {
                    continue
                }

                const targetNode = node.arguments[0]
                if (targetNode == null) {
                    continue
                }

                const rawName = getStringIfConstant(targetNode)
                if (typeof rawName !== "string") {
                    continue
                }

                const name = stripImportPathParams(rawName)
                if (includeCore || !isBuiltin(name)) {
                    targets.push(
                        new ImportTarget(
                            context,
                            targetNode,
                            name,
                            options,
                            "require"
                        )
                    )
                }
            }

            callback(targets)
        },
    }
}
