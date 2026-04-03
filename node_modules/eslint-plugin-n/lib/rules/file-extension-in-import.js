/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const path = require("path")
const fs = require("fs")
const { convertTsExtensionToJs } = require("../util/map-typescript-extension")
const getTryExtensions = require("../util/get-try-extensions")
const visitImport = require("../util/visit-import")

/**
 * Get all file extensions of the files which have the same basename.
 * @param {string} filePath The path to the original file to check.
 * @param {string} [basename] Optional basename to use instead of deriving from filePath.
 * @returns {string[]} File extensions.
 */
function getExistingExtensions(filePath, basename) {
    const directory = path.dirname(filePath)
    if (basename == null) {
        const extension = path.extname(filePath)
        basename = path.basename(filePath, extension)
    }

    try {
        return fs
            .readdirSync(directory)
            .filter(filename => filename.startsWith(`${basename}.`))
            .map(filename => path.extname(filename))
    } catch {
        return []
    }
}

/**
 * Get the extension of an index file in the given directory.
 * @param {string} directoryPath The directory path to check.
 * @param {string[]} tryExtensions Ordered extension preferences.
 * @returns {string | null} The index file extension or null if none.
 */
function getIndexExtension(directoryPath, tryExtensions) {
    try {
        if (fs.statSync(directoryPath).isDirectory() === false) {
            return null
        }
    } catch {
        return null
    }

    const existing = getExistingExtensions(path.join(directoryPath, "index"))
    if (existing.length === 0) {
        return null
    }

    const preferred = tryExtensions.find(ext => existing.includes(ext))
    if (preferred) {
        return preferred
    }

    return existing[0] || null
}

/**
 * @typedef {[
 *   ("always" | "never")?,
 *   {[ext in string]?: "always" | "never"}?
 * ]} RuleOptions
 */
/** @type {import('./rule-module').RuleModule<{RuleOptions: RuleOptions}>} */
module.exports = {
    meta: {
        docs: {
            description:
                "enforce the style of file extensions in `import` declarations",
            recommended: false,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/file-extension-in-import.md",
        },
        fixable: "code",
        messages: {
            requireExt: "require file extension '{{ext}}'.",
            forbidExt: "forbid file extension '{{ext}}'.",
        },
        schema: [
            {
                enum: ["always", "never"],
            },
            {
                type: "object",
                properties: {},
                additionalProperties: {
                    enum: ["always", "never"],
                },
            },
        ],
        type: "suggestion",
    },
    create(context) {
        if ((context.filename ?? context.getFilename()).startsWith("<")) {
            return {}
        }
        const defaultStyle = context.options[0] || "always"
        const overrideStyle = context.options[1] || {}
        const tryExtensions = getTryExtensions(context, 1)

        /**
         * @param {import("../util/import-target.js")} target
         * @returns {void}
         */
        function verify({ filePath, name, node, moduleType }) {
            // Ignore if it's not resolved to a file or it's a bare module.
            if (
                (moduleType !== "relative" && moduleType !== "absolute") ||
                filePath == null
            ) {
                return
            }

            // Get extension.
            const currentExt = path.extname(name)
            let actualExt = path.extname(filePath)
            let actualFilePath = filePath

            // If the file doesn't exist (or is a directory), the resolver may have returned
            // a fallback path. In this case, path.extname may return a "fake" extension
            // (e.g., ".client" for "utils.client" when the actual file is "utils.client.ts").
            // We need to search for the actual file using the full basename from the import.
            const fileExists =
                fs.existsSync(filePath) && fs.statSync(filePath).isFile()
            if (actualExt !== "" && !fileExists) {
                // Use the full basename (e.g., "utils.client") since what path.extname
                // thinks is an extension (e.g., ".client") may not be a real file extension
                const importBasename = path.basename(name)
                const extensions = getExistingExtensions(
                    filePath,
                    importBasename
                )
                // Find the preferred extension based on tryExtensions order
                const preferred = tryExtensions.find(ext =>
                    extensions.includes(ext)
                )
                const foundExt = preferred ?? extensions[0]
                if (foundExt) {
                    actualExt = foundExt
                    actualFilePath = path.join(
                        path.dirname(filePath),
                        `${importBasename}${actualExt}`
                    )
                }
            }

            let isDirectoryImport = false

            // Check for directory imports. This handles both:
            // 1. Normal case: "./my-folder" -> "./my-folder/index.js"
            // 2. Dot-in-name case: "./my-things.client" -> "./my-things.client/index.js"
            //    where path.extname incorrectly sees ".client" as an extension
            const isDirectory =
                fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()
            if (isDirectory) {
                const indexExt = getIndexExtension(filePath, tryExtensions)
                if (indexExt) {
                    isDirectoryImport = true
                    actualExt = indexExt
                    actualFilePath = path.join(filePath, `index${indexExt}`)
                }
            }

            const style = overrideStyle[actualExt] || defaultStyle

            let expectedExt = convertTsExtensionToJs(
                context,
                actualFilePath,
                actualExt
            )

            if (currentExt === "" && actualExt === "" && !isDirectoryImport) {
                const indexExt = getIndexExtension(filePath, tryExtensions)
                if (indexExt) {
                    isDirectoryImport = true
                    expectedExt = convertTsExtensionToJs(
                        context,
                        path.join(filePath, `index${indexExt}`),
                        indexExt
                    )
                }
            }

            // Verify.
            if (style === "always" && currentExt !== expectedExt) {
                context.report({
                    node,
                    messageId: "requireExt",
                    data: { ext: expectedExt },
                    fix(fixer) {
                        if (node.range == null) {
                            return null
                        }

                        const index = node.range[1] - 1
                        if (isDirectoryImport) {
                            const needsSlash = /[/\\]$/.test(name) ? "" : "/"
                            return fixer.insertTextBeforeRange(
                                [index, index],
                                `${needsSlash}index${expectedExt}`
                            )
                        }
                        return fixer.insertTextBeforeRange(
                            [index, index],
                            expectedExt
                        )
                    },
                })
            }

            if (
                style === "never" &&
                currentExt !== "" &&
                expectedExt !== "" &&
                currentExt === expectedExt
            ) {
                const otherExtensions = getExistingExtensions(filePath)
                /** @type {import('eslint').Rule.ReportDescriptor} */
                const descriptor = {
                    node,
                    messageId: "forbidExt",
                    data: { ext: currentExt },
                }

                if (otherExtensions.length === 1) {
                    descriptor.fix = fixer => {
                        if (node.range == null) {
                            return null
                        }

                        const index = name.lastIndexOf(currentExt)
                        const start = node.range[0] + 1 + index
                        const end = start + currentExt.length
                        return fixer.removeRange([start, end])
                    }
                }

                context.report(descriptor)
            }
        }

        return visitImport(context, { optionIndex: 1 }, targets => {
            targets.forEach(verify)
        })
    },
}
