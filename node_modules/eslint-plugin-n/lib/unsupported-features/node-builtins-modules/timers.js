"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const promises_api = {
    setTimeout: { [READ]: { supported: ["15.0.0"] } },
    setImmediate: { [READ]: { supported: ["15.0.0"] } },
    setInterval: { [READ]: { supported: ["15.9.0"] } },
    scheduler: {
        wait: { [READ]: { experimental: ["17.3.0", "16.14.0"] } },
        yield: { [READ]: { experimental: ["17.3.0", "16.14.0"] } },
    },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const timers = {
    Immediate: { [READ]: { supported: ["0.9.1"] } },
    Timeout: { [READ]: { supported: ["0.9.1"] } },
    setImmediate: { [READ]: { supported: ["0.9.1"] } },
    clearImmediate: { [READ]: { supported: ["0.9.1"] } },
    setInterval: { [READ]: { supported: ["0.0.1"] } },
    clearInterval: { [READ]: { supported: ["0.0.1"] } },
    setTimeout: { [READ]: { supported: ["0.0.1"] } },
    clearTimeout: { [READ]: { supported: ["0.0.1"] } },

    promises: { ...promises_api, [READ]: { supported: ["21.6.0"] } },

    // active: [Function: deprecated],
    // unenroll: [Function: deprecated],
    // enroll: [Function: deprecated]
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    timers: {
        [READ]: { supported: ["0.9.1"] },
        ...timers,
    },
    "node:timers": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...timers,
    },

    "timers/promises": {
        [READ]: {
            experimental: ["15.0.0"],
            supported: ["16.0.0"],
        },
        ...promises_api,
    },
    "node:timers/promises": {
        [READ]: {
            experimental: ["15.0.0"],
            supported: ["16.0.0"],
        },
        ...promises_api,
    },
}
