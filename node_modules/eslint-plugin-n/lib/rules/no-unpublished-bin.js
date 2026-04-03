/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const path = require("path")
const getConvertPath = require("../util/get-convert-path")
const getNpmignore = require("../util/get-npmignore")
const { getPackageJson } = require("../util/get-package-json")
const { isBinFile } = require("../util/is-bin-file")

/** @type {import('./rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description: "disallow `bin` files that npm ignores",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-bin.md",
        },
        type: "problem",
        fixable: null,
        schema: [
            {
                type: "object",
                properties: {
                    //
                    convertPath: getConvertPath.schema,
                },
            },
        ],
        messages: {
            invalidIgnored:
                "npm ignores '{{name}}'. Check 'files' field of 'package.json' or '.npmignore'.",
        },
    },
    create(context) {
        return {
            Program(node) {
                // Check file path.
                let rawFilePath = context.filename ?? context.getFilename()
                if (rawFilePath === "<input>") {
                    return
                }
                rawFilePath = path.resolve(rawFilePath)

                // Find package.json
                const packageJson = getPackageJson(rawFilePath)
                if (typeof packageJson?.filePath !== "string") {
                    return {}
                }

                // Convert by convertPath option
                const basedir = path.dirname(packageJson.filePath)
                const relativePath = getConvertPath(context)(
                    path.relative(basedir, rawFilePath).replace(/\\/gu, "/")
                )
                const filePath = path.join(basedir, relativePath)

                // Check this file is bin.
                if (!isBinFile(filePath, packageJson.bin, basedir)) {
                    return
                }

                // Check ignored or not
                const npmignore = getNpmignore(filePath)
                if (!npmignore.match(relativePath)) {
                    return
                }

                // Report.
                context.report({
                    node,
                    messageId: "invalidIgnored",
                    data: { name: relativePath },
                })
            },
        }
    },
}
