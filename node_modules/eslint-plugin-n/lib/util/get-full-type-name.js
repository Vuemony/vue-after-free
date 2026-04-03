"use strict"

const ts = (() => {
    try {
        // eslint-disable-next-line n/no-unpublished-require
        return require("typescript")
    } catch {
        return null
    }
})()

/**
 * @param {import('typescript').Type | null} type
 * @returns {string | null}
 */
module.exports = function getFullTypeName(type) {
    if (ts === null || type === null) {
        return null
    }

    /**
     * @type {string[]}
     */
    let nameParts = []
    let currentSymbol = type.getSymbol()
    while (currentSymbol !== undefined) {
        if (
            currentSymbol.valueDeclaration?.kind === ts.SyntaxKind.SourceFile ||
            currentSymbol.valueDeclaration?.kind ===
                ts.SyntaxKind.ModuleDeclaration
        ) {
            break
        }

        nameParts.unshift(currentSymbol.getName())
        currentSymbol =
            /** @type {import('typescript').Symbol & {parent: import('typescript').Symbol | undefined}} */ (
                currentSymbol
            ).parent
    }

    if (nameParts.length === 0) {
        return null
    }

    return nameParts.join(".")
}
