/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const path = require("path")
const matcher = require("ignore").default

const getConvertPath = require("../util/get-convert-path")
const { getPackageJson } = require("../util/get-package-json")
const getNpmignore = require("../util/get-npmignore")
const { isBinFile } = require("../util/is-bin-file")
const { getSourceCode } = require("../util/eslint-compat")

const ENV_SHEBANG = "#!/usr/bin/env"
const NODE_SHEBANG = `${ENV_SHEBANG} {{executableName}}\n`
const SHEBANG_PATTERN = /^(#!.+?)?(\r)?\n/u

// -i -S
// -u name
// --ignore-environment
// --block-signal=SIGINT
const ENV_FLAGS = /^\s*-(-.*?\b|[ivS]+|[Pu](\s+|=)\S+)(?=\s|$)/

// NAME="some variable"
// FOO=bar
const ENV_VARS = /^\s*\w+=(?:"(?:[^"\\]|\\.)*"|\w+)/

/**
 * @param {string} shebang
 * @param {string} executableName
 * @returns {boolean}
 */
function isNodeShebang(shebang, executableName) {
    if (shebang == null || shebang.length === 0) {
        return false
    }

    shebang = shebang.slice(shebang.indexOf(ENV_SHEBANG) + ENV_SHEBANG.length)
    while (ENV_FLAGS.test(shebang) || ENV_VARS.test(shebang)) {
        shebang = shebang.replace(ENV_FLAGS, "").replace(ENV_VARS, "")
    }

    const [command] = shebang.trim().split(" ")
    return command === executableName
}

/**
 * @param {import('eslint').Rule.RuleContext} context The rule context.
 * @returns {string}
 */
function getExpectedExecutableName(context) {
    const extension = path.extname(context.filename ?? context.getFilename())
    const { executableMap = {} } =
        /** @type {[{ executableMap: Record<string, string> }]} */
        (context.options)?.[0] ?? {}

    return executableMap[extension] ?? "node"
}

/**
 * Gets the shebang line (includes a line ending) from a given code.
 *
 * @param {import('eslint').SourceCode} sourceCode - A source code object to check.
 * @returns {{length: number, bom: boolean, shebang: string, cr: boolean}}
 *      shebang's information.
 *      `retv.shebang` is an empty string if shebang doesn't exist.
 */
function getShebangInfo(sourceCode) {
    const m = SHEBANG_PATTERN.exec(sourceCode.text)

    return {
        bom: sourceCode.hasBOM,
        cr: Boolean(m && m[2]),
        length: (m && m[0].length) || 0,
        shebang: (m && m[1] && `${m[1]}\n`) || "",
    }
}

/**
 * @typedef {[
 *   {
 *     convertPath?: import('../util/get-convert-path').ConvertPath;
 *     ignoreUnpublished?: boolean;
 *     additionalExecutables?: string[];
 *     executableMap?: Record<string, string>;
 *   }?
 * ]} RuleOptions
 */
/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        docs: {
            description: "require correct usage of hashbang",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md",
        },
        type: "problem",
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    convertPath: getConvertPath.schema,
                    ignoreUnpublished: { type: "boolean" },
                    additionalExecutables: {
                        type: "array",
                        items: { type: "string" },
                    },
                    executableMap: {
                        type: "object",
                        patternProperties: {
                            "^\\.\\w+$": {
                                type: "string",
                                pattern: "^[\\w-]+$",
                            },
                        },
                        additionalProperties: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpectedBOM: "This file must not have Unicode BOM.",
            expectedLF: "This file must have Unix linebreaks (LF).",
            expectedHashbangNode:
                'This file needs shebang "#!/usr/bin/env {{executableName}}".',
            expectedHashbang: "This file needs no shebang.",
        },
    },
    create(context) {
        const sourceCode = getSourceCode(context)
        const filePath = context.filename ?? context.getFilename()
        if (filePath === "<input>") {
            return {}
        }

        const packageJson = getPackageJson(filePath)
        if (typeof packageJson?.filePath !== "string") {
            return {}
        }

        const packageDirectory = path.dirname(packageJson.filePath)

        const originalAbsolutePath = path.resolve(filePath)
        const originalRelativePath = path
            .relative(packageDirectory, originalAbsolutePath)
            .replace(/\\/gu, "/")

        const convertedRelativePath =
            getConvertPath(context)(originalRelativePath)
        const convertedAbsolutePath = path.resolve(
            packageDirectory,
            convertedRelativePath
        )

        /** @type {{ additionalExecutables?: string[] }} */
        const { additionalExecutables = [] } = context.options?.[0] ?? {}

        const executable = matcher()
        executable.add(additionalExecutables)
        const isExecutable = executable.test(convertedRelativePath)

        if (
            (additionalExecutables.length === 0 ||
                isExecutable.ignored === false) &&
            context.options?.[0]?.ignoreUnpublished === true
        ) {
            const npmignore = getNpmignore(convertedAbsolutePath)

            if (npmignore.match(convertedRelativePath)) {
                return {}
            }
        }

        const needsShebang =
            isExecutable.ignored === true ||
            isBinFile(convertedAbsolutePath, packageJson?.bin, packageDirectory)
        const executableName = getExpectedExecutableName(context)
        const info = getShebangInfo(sourceCode)

        return {
            Program() {
                const loc = {
                    start: { line: 1, column: 0 },
                    end: {
                        line: 1,
                        column: sourceCode.lines.at(0)?.length ?? 0,
                    },
                }

                if (
                    needsShebang
                        ? isNodeShebang(info.shebang, executableName)
                        : !info.shebang
                ) {
                    // Good the shebang target.
                    // Checks BOM and \r.
                    if (needsShebang && info.bom) {
                        context.report({
                            loc,
                            messageId: "unexpectedBOM",
                            fix(fixer) {
                                return fixer.removeRange([-1, 0])
                            },
                        })
                    }
                    if (needsShebang && info.cr) {
                        context.report({
                            loc,
                            messageId: "expectedLF",
                            fix(fixer) {
                                const index = sourceCode.text.indexOf("\r")
                                return fixer.removeRange([index, index + 1])
                            },
                        })
                    }
                } else if (needsShebang) {
                    // Shebang is lacking.
                    context.report({
                        loc,
                        messageId: "expectedHashbangNode",
                        data: { executableName },
                        fix(fixer) {
                            return fixer.replaceTextRange(
                                [-1, info.length],
                                NODE_SHEBANG.replaceAll(
                                    "{{executableName}}",
                                    executableName
                                )
                            )
                        },
                    })
                } else {
                    // Shebang is extra.
                    context.report({
                        loc,
                        messageId: "expectedHashbang",
                        fix(fixer) {
                            return fixer.removeRange([0, info.length])
                        },
                    })
                }
            },
        }
    },
}
