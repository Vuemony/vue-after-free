"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const common_objects = {
    Network: {
        dataReceived: { [READ]: { supported: ["22.17.0"] } },
        dataSent: { [READ]: { supported: ["22.18.0"] } },
        loadingFailed: { [READ]: { experimental: ["22.7.0", "20.18.0"] } },
        loadingFinished: { [READ]: { experimental: ["22.6.0", "20.18.0"] } },
        requestWillBeSent: { [READ]: { experimental: ["22.6.0", "20.18.0"] } },
        responseReceived: { [READ]: { experimental: ["22.6.0", "20.18.0"] } },
    },
    NetworkResources: {
        put: { [READ]: { experimental: ["22.19.0"] } },
    },
    console: { [READ]: { supported: ["8.0.0"] } },
    close: { [READ]: { supported: ["9.0.0"] } },
    open: { [READ]: { supported: ["8.0.0"] } },
    url: { [READ]: { supported: ["8.0.0"] } },
    waitForDebugger: { [READ]: { supported: ["12.7.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const promises_api = {
    Session: { [READ]: { supported: ["19.0.0"] } },
    ...common_objects,
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const callback_api = {
    Session: { [READ]: { supported: ["8.0.0"] } },
    ...common_objects,
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    inspector: {
        [READ]: {
            experimental: ["8.0.0"],
            supported: ["14.0.0"],
        },
        ...callback_api,
    },
    "node:inspector": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...callback_api,
    },

    "inspector/promises": {
        [READ]: { experimental: ["19.0.0"] },
        ...promises_api,
    },
    "node:inspector/promises": {
        [READ]: { experimental: ["19.0.0"] },
        ...promises_api,
    },
}
