/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { CALL, CONSTRUCT, READ } = require("@eslint-community/eslint-utils")
const unprefixNodeColon = require("./unprefix-node-colon")

/** @typedef {import('../unsupported-features/types.js').DeprecatedInfoTraceMap} DeprecatedInfoTraceMap */
/** @typedef {import('../unsupported-features/types.js').SupportVersionTraceMap} SupportVersionTraceMap */

/**
 * @template {SupportVersionTraceMap | DeprecatedInfoTraceMap} TraceMap
 * Enumerate property names of a given object recursively.
 * @param {TraceMap} traceMap The map for APIs to enumerate.
 * @param {string[]} [path] The path to the current map.
 * @param {{ [key: string]: WeakSet<TraceMap> }} [recursion] An object to block recursion (per module)
 * @returns {IterableIterator<string>} The property names of the map.
 */
function* enumeratePropertyNames(traceMap, path = [], recursion = {}) {
    const recursionSet =
        typeof path[0] === "string"
            ? (recursion[path[0]] ??= new WeakSet())
            : undefined

    if (recursionSet?.has(traceMap)) {
        return
    }

    for (const key of Object.getOwnPropertyNames(traceMap)) {
        const childValue = traceMap[key]
        const childPath = [...path, key]
        const childName = unprefixNodeColon(childPath.join("."))

        if (childValue == null) {
            continue
        }

        if (childValue[CALL]) {
            yield `${childName}()`
        }

        if (childValue[CONSTRUCT]) {
            yield `new ${childName}()`
        }

        if (childValue[READ]) {
            yield childName
        }

        recursionSet?.add(traceMap)
        yield* enumeratePropertyNames(childValue, childPath, recursion)
    }
}

module.exports = enumeratePropertyNames
