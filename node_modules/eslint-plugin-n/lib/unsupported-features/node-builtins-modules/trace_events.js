"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const trace_events = {
    createTracing: { [READ]: { supported: ["10.0.0"] } },
    getEnabledCategories: { [READ]: { supported: ["10.0.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    trace_events: {
        [READ]: { experimental: ["10.0.0"] },
        ...trace_events,
    },
    "node:trace_events": {
        [READ]: { experimental: ["14.13.1", "12.20.0"] },
        ...trace_events,
    },
}
