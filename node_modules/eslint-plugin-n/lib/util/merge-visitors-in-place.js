/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

/**
 * Merge two visitors.
 * This function modifies `visitor1` directly to merge.
 * @param {import('eslint').Rule.RuleListener} visitor1 The visitor which is assigned.
 * @param {import('eslint').Rule.RuleListener} visitor2 The visitor which is assigning.
 * @returns {import('eslint').Rule.RuleListener} `visitor1`.
 */
module.exports = function mergeVisitorsInPlace(visitor1, visitor2) {
    for (const key of Object.keys(visitor2)) {
        const handler1 = visitor1[key]
        const handler2 = visitor2[key]

        if (typeof handler1 !== "function") {
            visitor1[key] = handler2
            continue
        }

        if (typeof handler2 !== "function") {
            continue
        }

        if ("_handlers" in handler1 && Array.isArray(handler1._handlers)) {
            handler1._handlers.push(handler2)
            continue
        }

        const handlers = [handler1, handler2]

        visitor1[key] = Object.assign(dispatch.bind(null, handlers), {
            _handlers: handlers,
        })
    }

    return visitor1
}

/**
 * Dispatch all given functions with a node.
 * @param {function[]} handlers The function list to call.
 * @param {import('estree').Node} node The AST node to be handled.
 * @returns {void}
 */
function dispatch(handlers, node) {
    for (const h of handlers) {
        h(node)
    }
}
