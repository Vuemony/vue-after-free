"use strict"

/**
 * @param {import('estree').Node} node
 * @returns {node is (import('estree').Node & { parent: import('estree').Node })}
 */
function hasParentNode(node) {
    return (
        typeof node.type === "string" &&
        "parent" in node &&
        node.parent != null &&
        typeof node.parent === "object" &&
        "type" in node.parent &&
        typeof node.parent.type === "string"
    )
}

module.exports = { hasParentNode }
