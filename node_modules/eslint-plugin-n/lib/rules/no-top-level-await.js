/**
 * @author Yosuke Ota <https://github.com/ota-meshi>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const path = require("path")
const { getSourceCode } = require("../util/eslint-compat")
const getConvertPath = require("../util/get-convert-path")
const { getPackageJson } = require("../util/get-package-json")
const { isBinFile } = require("../util/is-bin-file")
const getNpmignore = require("../util/get-npmignore")

const HASHBANG_ENV = "#!/usr/bin/env"

/**
 * @typedef {[
 *   {
 *     ignoreBin?:boolean
 *     convertPath?: import('../util/get-convert-path').ConvertPath;
 *   }?
 * ]} RuleOptions
 */

/**
 * Checks whether the code has a hashbang comment or not.
 * @param {import('./rule-module').PluginRuleContext<{RuleOptions: RuleOptions}>} context
 */
function hasHashbang(context) {
    const sourceCode = getSourceCode(context)
    return Boolean(sourceCode.text.startsWith(HASHBANG_ENV))
}

/** @param {import('./rule-module').PluginRuleContext<{RuleOptions: RuleOptions}>} context */
function ignore(context) {
    const options = context.options[0] || {}
    const ignoreBin = options.ignoreBin ?? false
    if (ignoreBin && hasHashbang(context)) {
        // If the code has a hashbang comment, it is considered an executable file.
        return true
    }

    const filePath = context.filename ?? context.getFilename()
    if (filePath === "<input>") {
        // The file path is "<input>" (not specified), so it will be ignored.
        return true
    }
    const originalAbsolutePath = path.resolve(filePath)

    // Find package.json
    const packageJson = getPackageJson(originalAbsolutePath)
    if (typeof packageJson?.filePath !== "string") {
        // The file is not in a package, so it will be ignored.
        return true
    }

    // Convert by convertPath option
    const packageDirectory = path.dirname(packageJson.filePath)
    const convertedRelativePath = getConvertPath(context)(
        path
            .relative(packageDirectory, originalAbsolutePath)
            .replace(/\\/gu, "/")
    )
    const convertedAbsolutePath = path.resolve(
        packageDirectory,
        convertedRelativePath
    )

    if (
        ignoreBin &&
        isBinFile(convertedAbsolutePath, packageJson.bin, packageDirectory)
    ) {
        // The file is defined in the `bin` field of `package.json`
        return true
    }

    // Check ignored or not
    const npmignore = getNpmignore(convertedAbsolutePath)
    if (npmignore.match(convertedRelativePath)) {
        // The file is unpublished file, so it will be ignored.
        return true
    }

    return false
}

/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        docs: {
            description: "disallow top-level `await` in published modules",
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-top-level-await.md",
        },
        fixable: null,
        messages: {
            forbidden: "Top-level `await` is forbidden in published modules.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    ignoreBin: { type: "boolean" },
                    convertPath: getConvertPath.schema,
                },
                additionalProperties: false,
            },
        ],
        type: "problem",
    },
    create(context) {
        if (ignore(context)) {
            return {}
        }
        let functionDepth = 0
        return {
            ":function"() {
                functionDepth++
            },
            ":function:exit"() {
                functionDepth--
            },
            /**
             * @param {import('estree').AwaitExpression | import('estree').ForOfStatement | import('estree').VariableDeclaration} node
             */
            "AwaitExpression, ForOfStatement[await=true], VariableDeclaration[kind='await using']"(
                node
            ) {
                if (functionDepth > 0) {
                    // not top-level
                    return
                }
                context.report({ node, messageId: "forbidden" })
            },
        }
    },
}
