"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const async_hooks = {
    createHook: { [READ]: { experimental: ["8.1.0"] } },
    executionAsyncResource: { [READ]: { experimental: ["13.9.0", "12.17.0"] } },
    executionAsyncId: { [READ]: { experimental: ["8.1.0"] } },
    triggerAsyncId: { [READ]: { experimental: ["8.1.0"] } },
    AsyncLocalStorage: {
        [READ]: {
            experimental: ["13.10.0", "12.17.0"],
            supported: ["16.4.0"],
        },
        bind: {
            [READ]: {
                experimental: ["19.8.0", "18.16.0"],
                supported: ["22.15.0", "23.11.0"],
            },
        },
        snapshot: {
            [READ]: {
                experimental: ["19.8.0", "18.16.0"],
                supported: ["22.15.0", "23.11.0"],
            },
        },
    },
    AsyncResource: {
        [READ]: {
            experimental: ["9.6.0", "8.12.0"],
            supported: ["16.4.0"],
        },
        bind: { [READ]: { supported: ["14.8.0", "12.19.0"] } },
    },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    async_hooks: {
        [READ]: {
            experimental: ["8.1.0"],
            supported: ["16.4.0"],
        },
        ...async_hooks,
    },
    "node:async_hooks": {
        [READ]: {
            experimental: ["14.13.1", "12.20.0"],
            supported: ["16.4.0"],
        },
        ...async_hooks,
    },
}
