"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const diagnostics_channel = {
    hasSubscribers: { [READ]: { supported: ["15.1.0", "14.17.0"] } },
    channel: { [READ]: { supported: ["15.1.0", "14.17.0"] } },
    subscribe: { [READ]: { supported: ["18.7.0", "16.17.0"] } },
    unsubscribe: { [READ]: { supported: ["18.7.0", "16.17.0"] } },
    tracingChannel: { [READ]: { experimental: ["19.9.0"] } },
    Channel: { [READ]: { supported: ["15.1.0", "14.17.0"] } },
    TracingChannel: { [READ]: { experimental: ["19.9.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    diagnostics_channel: {
        [READ]: {
            experimental: ["15.1.0", "14.17.0"],
            supported: ["19.2.0", "18.13.0"],
        },
        ...diagnostics_channel,
    },
    "node:diagnostics_channel": {
        [READ]: {
            experimental: ["15.1.0", "14.17.0"],
            supported: ["19.2.0", "18.13.0"],
        },
        ...diagnostics_channel,
    },
}
