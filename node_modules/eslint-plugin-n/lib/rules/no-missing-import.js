/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { checkExistence, messages } = require("../util/check-existence")
const getAllowModules = require("../util/get-allow-modules")
const getResolvePaths = require("../util/get-resolve-paths")
const getResolverConfig = require("../util/get-resolver-config")
const getTryExtensions = require("../util/get-try-extensions")
const getTSConfig = require("../util/get-tsconfig")
const getTypescriptExtensionMap = require("../util/get-typescript-extension-map")
const visitImport = require("../util/visit-import")

/**
 * @typedef {[
 *   {
 *     allowModules?: import('../util/get-allow-modules').AllowModules;
 *     resolvePaths?: import('../util/get-resolve-paths').ResolvePaths;
 *     resolverConfig?: import('../util/get-resolver-config').ResolverConfig;
 *     tryExtensions?: import('../util/get-try-extensions').TryExtensions;
 *     ignoreTypeImport?: boolean;
 *     tsconfigPath?: import('../util/get-tsconfig').TSConfigPath;
 *     typescriptExtensionMap?: import('../util/get-typescript-extension-map').TypescriptExtensionMap;
 *   }?
 * ]} RuleOptions
 */
/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        docs: {
            description:
                "disallow `import` declarations which import missing modules",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md",
        },
        type: "problem",
        fixable: null,
        schema: [
            {
                type: "object",
                properties: {
                    allowModules: getAllowModules.schema,
                    resolvePaths: getResolvePaths.schema,
                    resolverConfig: getResolverConfig.schema,
                    tryExtensions: getTryExtensions.schema,
                    ignoreTypeImport: { type: "boolean", default: false },
                    tsconfigPath: getTSConfig.schema,
                    typescriptExtensionMap: getTypescriptExtensionMap.schema,
                },
                additionalProperties: false,
            },
        ],
        messages,
    },
    create(context) {
        const options = context.options[0] ?? {}
        const ignoreTypeImport = options.ignoreTypeImport ?? false

        const filePath = context.filename ?? context.getFilename()
        if (filePath === "<input>") {
            return {}
        }

        return visitImport(context, { ignoreTypeImport }, targets => {
            checkExistence(context, targets)
        })
    },
}
