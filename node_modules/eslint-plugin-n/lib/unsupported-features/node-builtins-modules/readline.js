"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const promises_api = {
    createInterface: { [READ]: { supported: ["17.0.0"] } },
    Interface: { [READ]: { supported: ["17.0.0"] } },
    Readline: { [READ]: { supported: ["17.0.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const readline = {
    promises: {
        [READ]: { experimental: ["17.0.0"] },
        ...promises_api,
    },
    clearLine: { [READ]: { supported: ["0.7.7"] } },
    clearScreenDown: { [READ]: { supported: ["0.7.7"] } },
    createInterface: { [READ]: { supported: ["0.1.98"] } },
    cursorTo: { [READ]: { supported: ["0.7.7"] } },
    moveCursor: { [READ]: { supported: ["0.7.7"] } },
    Interface: { [READ]: { supported: ["0.1.104"] } },
    emitKeypressEvents: { [READ]: { supported: ["0.7.7"] } },
    InterfaceConstructor: { [READ]: { supported: ["0.1.104"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    readline: {
        [READ]: { supported: ["0.1.98"] },
        ...readline,
    },
    "node:readline": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...readline,
    },

    "readline/promises": {
        [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] },
        ...promises_api,
    },
    "node:readline/promises": {
        [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] },
        ...promises_api,
    },
}
