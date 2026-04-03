"use strict"
const {
    CALL,
    getStringIfConstant,
    READ,
} = require("@eslint-community/eslint-utils")
const processGetBuiltinModuleCall = {
    process: {
        getBuiltinModule: {
            [CALL]: true,
        },
    },
}
/**
 * Iterate the references of process.getBuiltinModule() modules.
 * @template Info
 * @param {import("@eslint-community/eslint-utils").ReferenceTracker} tracker The reference tracker.
 * @param {import("@eslint-community/eslint-utils").TraceMap<Info>} traceMap The trace map.
 * @returns {IterableIterator<import("@eslint-community/eslint-utils").Reference<Info>>} The iterator.
 */
function* iterateProcessGetBuiltinModuleReferences(tracker, traceMap) {
    for (const { node } of tracker.iterateGlobalReferences(
        processGetBuiltinModuleCall
    )) {
        if (node.type !== "CallExpression") continue
        const key = node.arguments[0] && getStringIfConstant(node.arguments[0])
        if (key == null) {
            continue
        }
        const nextTraceMap = Object.hasOwn(traceMap, key) && traceMap[key]
        if (!nextTraceMap) {
            continue
        }

        if (nextTraceMap[READ]) {
            yield {
                node,
                path: [key],
                type: READ,
                info: nextTraceMap[READ],
            }
        }

        for (const ref of tracker.iteratePropertyReferences(
            node,
            nextTraceMap
        )) {
            yield {
                ...ref,
                path: [key, ...ref.path],
            }
        }
    }
}

module.exports = { iterateProcessGetBuiltinModuleReferences }
