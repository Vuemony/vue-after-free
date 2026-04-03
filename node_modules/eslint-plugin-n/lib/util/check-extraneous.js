/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const getAllowModules = require("./get-allow-modules")
const { getPackageJson } = require("./get-package-json")

/**
 * Checks whether or not each requirement target is published via package.json.
 *
 * It reads package.json and checks the target exists in `dependencies`.
 *
 * @param {import('eslint').Rule.RuleContext} context - A context to report.
 * @param {string} filePath - The current file path.
 * @param {import('./import-target.js')[]} targets - A list of target information to check.
 * @returns {void}
 */
exports.checkExtraneous = function checkExtraneous(context, filePath, targets) {
    const packageInfo = getPackageJson(filePath)
    if (!packageInfo) {
        return
    }

    const allowed = new Set(getAllowModules(context))
    const dependencies = new Set(
        [packageInfo.name].concat(
            Object.keys(packageInfo.dependencies || {}),
            Object.keys(packageInfo.devDependencies || {}),
            Object.keys(packageInfo.peerDependencies || {}),
            Object.keys(packageInfo.optionalDependencies || {})
        )
    )

    for (const target of targets) {
        if (
            target.moduleName != null &&
            target.filePath != null &&
            !dependencies.has(target.moduleName) &&
            !allowed.has(target.moduleName) &&
            // https://github.com/eslint-community/eslint-plugin-n/issues/379
            !target.hasTSAlias()
        ) {
            context.report({
                node: target.node,
                messageId: "extraneous",
                data: {
                    moduleName: target.moduleName,
                },
            })
        }
    }
}

exports.messages = {
    extraneous: '"{{moduleName}}" is extraneous.',
}
