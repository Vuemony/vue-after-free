'use strict'

/**
 * @param {string} objectName
 * @param {Node} node
 * @returns {node is CallExpression}
 */
function isMemberCallWithObjectName(objectName, node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    ((node.callee.object.type === 'Identifier' &&
      node.callee.object.name === objectName) ||
      isMemberCallWithObjectName(objectName, node.callee.object))
  )
}

module.exports = isMemberCallWithObjectName
