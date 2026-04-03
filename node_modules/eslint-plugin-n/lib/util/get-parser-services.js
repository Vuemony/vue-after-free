"use strict"

const ERROR_MESSAGE_REQUIRES_PARSER_SERVICES =
    "You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file. See https://typescript-eslint.io/getting-started/typed-linting for enabling linting with type information."
const ERROR_MESSAGE_UNKNOWN_PARSER =
    'Note: detected a parser other than @typescript-eslint/parser. Make sure the parser is configured to forward "parserOptions.project" to @typescript-eslint/parser.'

/**
 * Checks if the parser seems to be `@typescript-eslint/parser`.
 * - Implementation from `@typescript-eslint/utils`. @see https://github.com/typescript-eslint/typescript-eslint/blob/3e545207f0e34611f528128fc699b25091bc40b3/packages/utils/src/eslint-utils/parserSeemsToBeTSESLint.ts
 *
 * @param {string | undefined} parser - The parser to check.
 * @returns {boolean} `true` if the parser seems to be `@typescript-eslint/parser`, `false` otherwise.
 */
function parserSeemsToBeTSESLint(parser) {
    return !!parser && /(?:typescript-eslint|\.\.)[\w/\\]*parser/.test(parser)
}

/**
 * Throws a detailed error if parser services are not available.
 * @param {string | undefined} parser - The parser name to mention in the error message.
 */
function throwError(parser) {
    const messages = [
        ERROR_MESSAGE_REQUIRES_PARSER_SERVICES,
        `Parser: ${parser || "(unknown)"}`,
        !parserSeemsToBeTSESLint(parser) && ERROR_MESSAGE_UNKNOWN_PARSER,
    ].filter(Boolean)
    throw new Error(messages.join("\n"))
}

/**
 * Get the TypeScript parser services.
 * - Partial implementation from `@typescript-eslint/utils`. @see https://github.com/typescript-eslint/typescript-eslint/blob/3e545207f0e34611f528128fc699b25091bc40b3/packages/utils/src/eslint-utils/getParserServices.ts
 *
 * @param {import('eslint').Rule.RuleContext} context - Rule context.
 * @returns {import('@typescript-eslint/parser').ParserServices | null} Parser services if TypeScript is being used, `null` otherwise.
 * @throws {Error} If parser services are present but incomplete.
 */
module.exports = function getParserServices(context) {
    const parserServices = context.sourceCode.parserServices

    if (
        !parserServices ||
        parserServices.esTreeNodeToTSNodeMap == null ||
        parserServices.tsNodeToESTreeNodeMap == null
    ) {
        // Not using TypeScript parser, or no type info: return null for legacy/JS support.
        return null
    }

    if (parserServices.program == null) {
        const parser =
            context.parserPath || context.languageOptions?.parser?.meta?.name
        throwError(parser)
    }

    return parserServices
}
