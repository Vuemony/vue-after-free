/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { checkPublish, messages } = require("../util/check-publish")
const getAllowModules = require("../util/get-allow-modules")
const getConvertPath = require("../util/get-convert-path")
const getResolvePaths = require("../util/get-resolve-paths")
const getResolverConfig = require("../util/get-resolver-config")
const getTryExtensions = require("../util/get-try-extensions")
const visitRequire = require("../util/visit-require")

/**
 * @typedef {[
 *   {
 *     allowModules?: import('../util/get-allow-modules').AllowModules;
 *     convertPath?: import('../util/get-convert-path').ConvertPath;
 *     resolvePaths?: import('../util/get-resolve-paths').ResolvePaths;
 *     resolverConfig?: import('../util/get-resolver-config').ResolverConfig;
 *     tryExtensions?: import('../util/get-try-extensions').TryExtensions;
 *     ignorePrivate?: boolean;
 *   }?
 * ]} RuleOptions
 */
/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        docs: {
            description:
                "disallow `require()` expressions which import private modules",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md",
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
                    tryExtensions: getTryExtensions.schema,
                    ignorePrivate: { type: "boolean", default: true },
                },
                additionalProperties: false,
            },
        ],
        messages,
    },
    create(context) {
        const filePath = context.filename ?? context.getFilename()
        const options = context.options[0] || {}
        const ignorePrivate = options.ignorePrivate ?? true

        if (filePath === "<input>") {
            return {}
        }

        return visitRequire(context, {}, targets => {
            checkPublish(context, filePath, targets, { ignorePrivate })
        })
    },
}
