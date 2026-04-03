"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const assert = {
    Assert: { [READ]: { supported: ["22.19.0"] } },
    assert: { [READ]: { supported: ["0.5.9"] } },
    deepEqual: { [READ]: { supported: ["0.1.21"] } },
    deepStrictEqual: { [READ]: { supported: ["1.2.0"] } },
    doesNotMatch: {
        [READ]: {
            experimental: ["13.6.0", "12.16.0"],
            supported: ["16.0.0"],
        },
    },
    doesNotReject: { [READ]: { supported: ["10.0.0"] } },
    doesNotThrow: { [READ]: { supported: ["0.1.21"] } },
    equal: { [READ]: { supported: ["0.1.21"] } },
    fail: { [READ]: { supported: ["0.1.21"] } },
    ifError: { [READ]: { supported: ["0.1.97"] } },
    match: {
        [READ]: {
            experimental: ["13.6.0", "12.16.0"],
            supported: ["16.0.0"],
        },
    },
    notDeepEqual: { [READ]: { supported: ["0.1.21"] } },
    notDeepStrictEqual: { [READ]: { supported: ["1.2.0"] } },
    notEqual: { [READ]: { supported: ["0.1.21"] } },
    notStrictEqual: { [READ]: { supported: ["0.1.21"] } },
    ok: { [READ]: { supported: ["0.1.21"] } },
    partialDeepStrictEqual: {
        [READ]: {
            experimental: ["22.13.0", "23.4.0"],
        },
    },
    rejects: { [READ]: { supported: ["10.0.0"] } },
    strictEqual: { [READ]: { supported: ["0.1.21"] } },
    throws: { [READ]: { supported: ["0.1.21"] } },
    CallTracker: {
        [READ]: {
            experimental: ["14.2.0", "12.19.0"],
            deprecated: ["20.1.0"],
        },
    },
    strict: {},
}

assert.strict = {
    ...assert,
    [READ]: { supported: ["9.9.0", "8.13.0"] },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    assert: {
        ...assert,
        [READ]: { supported: ["0.1.21"] },
    },
    "node:assert": {
        ...assert,
        [READ]: { supported: ["14.13.1", "12.20.0"] },
    },
    "assert/strict": {
        ...assert.strict,
        [READ]: { supported: ["15.0.0"] },
    },
    "node:assert/strict": {
        ...assert.strict,
        [READ]: { supported: ["15.0.0"] },
    },
}
