/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const globrex = require("globrex")

/**
 * @typedef PathConvertion
 * @property {string[]} include
 * @property {string[]} exclude
 * @property {[string, string]} replace
 */
/** @typedef {PathConvertion[] | Record<string, [ string, string ]>} ConvertPath */
/** @typedef {{match: (filePath: string) => boolean, convert: (filePath: string) => string}} Converter */

/** @type {Converter['convert']} */
function identity(x) {
    return x
}

/**
 * Ensures the given value is a string array.
 *
 * @param {unknown[]} x - The value to ensure.
 * @returns {string[]} The string array.
 */
function toStringArray(x) {
    if (Array.isArray(x)) {
        return x.map(String)
    }
    return []
}

/**
 * Converts old-style value to new-style value.
 *
 * @param {ConvertPath} x - The value to convert.
 * @returns {PathConvertion[]} Normalized value.
 */
function normalizeValue(x) {
    if (Array.isArray(x)) {
        return x.map(({ include, exclude, replace }) => ({
            include: toStringArray(include),
            exclude: toStringArray(exclude),
            replace: replace,
        }))
    }

    return Object.entries(x).map(([pattern, replace]) => ({
        include: [pattern],
        exclude: [],
        replace: replace,
    }))
}

/**
 * @param {string} pattern
 * @return {globrex.Results}
 */
function makeMatcher(pattern) {
    return globrex(pattern, { globstar: true })
}

/**
 * Creates the function which checks whether a file path is matched with the given pattern or not.
 *
 * @param {string[]} includePatterns - The glob patterns to include files.
 * @param {string[]} excludePatterns - The glob patterns to exclude files.
 * @returns {Converter['match']} Created predicate function.
 */
function createMatch(includePatterns, excludePatterns) {
    const include = includePatterns.map(makeMatcher)
    const exclude = excludePatterns.map(makeMatcher)

    return filePath =>
        include.some(m => m.regex.test(filePath)) &&
        !exclude.some(m => m.regex.test(filePath))
}

/**
 * Creates a function which replaces a given path.
 *
 * @param {RegExp} fromRegexp - A `RegExp` object to replace.
 * @param {string} toStr - A new string to replace.
 * @returns {Converter['convert']} A function which replaces a given path.
 */
function defineConvert(fromRegexp, toStr) {
    return filePath => filePath.replace(fromRegexp, toStr)
}

/**
 * Combines given converters.
 * The result function converts a given path with the first matched converter.
 *
 * @param {Converter[]} converters - A list of converters to combine.
 * @returns {Converter['convert']} A function which replaces a given path.
 */
function combine(converters) {
    return filePath => {
        for (const converter of converters) {
            if (converter.match(filePath)) {
                return converter.convert(filePath)
            }
        }
        return filePath
    }
}

/**
 * @typedef {{ convertPath?: ConvertPath } | undefined} ConvertPathOption
 */

/**
 * Parses `convertPath` property from a given option object.
 *
 * @param {ConvertPathOption} option - An option object to get.
 * @returns {Converter['convert']|null} A function which converts a path., or `null`.
 */
function parse(option) {
    if (option?.convertPath == null) {
        return null
    }

    const converters = []
    for (const pattern of normalizeValue(option.convertPath)) {
        const fromRegexp = new RegExp(String(pattern.replace[0]))
        const toStr = String(pattern.replace[1])

        converters.push({
            match: createMatch(pattern.include, pattern.exclude),
            convert: defineConvert(fromRegexp, toStr),
        })
    }

    return combine(converters)
}

/**
 * Gets "convertPath" setting.
 *
 * 1. This checks `options` property, then returns it if exists.
 * 2. This checks `settings.n` | `settings.node` property, then returns it if exists.
 * 3. This returns a function of identity.
 *
 * @param {import('eslint').Rule.RuleContext} context - The rule context.
 * @returns {Converter['convert']} A function which converts a path.
 */
module.exports = function getConvertPath(context) {
    return (
        parse(/** @type {ConvertPathOption} */ (context.options?.[0])) ??
        parse(/** @type {ConvertPathOption} */ (context.settings?.n)) ??
        parse(/** @type {ConvertPathOption} */ (context.settings?.node)) ??
        identity
    )
}

/**
 * JSON Schema for `convertPath` option.
 */
module.exports.schema = {
    anyOf: [
        {
            type: "object",
            properties: {},
            patternProperties: {
                "^.+$": {
                    type: "array",
                    items: { type: "string" },
                    minItems: 2,
                    maxItems: 2,
                },
            },
            additionalProperties: false,
        },
        {
            type: "array",
            items: {
                type: "object",
                properties: {
                    include: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 1,
                        uniqueItems: true,
                    },
                    exclude: {
                        type: "array",
                        items: { type: "string" },
                        uniqueItems: true,
                    },
                    replace: {
                        type: "array",
                        items: { type: "string" },
                        minItems: 2,
                        maxItems: 2,
                    },
                },
                additionalProperties: false,
                required: ["include", "replace"],
            },
            minItems: 1,
        },
    ],
}
