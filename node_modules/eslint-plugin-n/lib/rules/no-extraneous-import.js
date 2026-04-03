/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { checkExtraneous, messages } = require("../util/check-extraneous")
const getAllowModules = require("../util/get-allow-modules")
const getConvertPath = require("../util/get-convert-path")
const getResolvePaths = require("../util/get-resolve-paths")
const getResolverConfig = require("../util/get-resolver-config")
const visitImport = require("../util/visit-import")

/** @type {import('./rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description:
                "disallow `import` declarations which import extraneous modules",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md",
        },
        type: "problem",
        fixable: null,
        schema: [
            {
                type: "object",
                properties: {
                    allowModules: getAllowModules.schema,
                    convertPath: getConvertPath.schema,
                    resolvePaths: getResolvePaths.schema,
                    resolverConfig: getResolverConfig.schema,
                },
                additionalProperties: false,
            },
        ],
        messages,
    },
    create(context) {
        const filePath = context.filename ?? context.getFilename()
        if (filePath === "<input>") {
            return {}
        }

        return visitImport(context, {}, targets => {
            checkExtraneous(context, filePath, targets)
        })
    },
}
