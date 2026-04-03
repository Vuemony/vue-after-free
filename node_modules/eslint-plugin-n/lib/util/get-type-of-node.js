"use strict"

/**
 * Get the type of a node.
 * If TypeScript isn't present, returns `null`.
 *
 * @param {import('estree').Node} node - A node
 * @param {import('@typescript-eslint/parser').ParserServices} parserServices - A parserServices
 * @returns {import('typescript').Type | null}
 */
module.exports = function getTypeOfNode(node, parserServices) {
    const { esTreeNodeToTSNodeMap, program } = parserServices
    if (program === null) {
        return null
    }
    const tsNode = esTreeNodeToTSNodeMap.get(/** @type {any} */ (node))
    const checker = program.getTypeChecker()
    const nodeType = checker.getTypeAtLocation(tsNode)
    const constrained = checker.getBaseConstraintOfType(nodeType)
    return constrained ?? nodeType
}
