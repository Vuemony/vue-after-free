"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const EventEmitterStatic = {
    defaultMaxListeners: { [READ]: { supported: ["0.11.2"] } },
    errorMonitor: { [READ]: { supported: ["13.6.0", "12.17.0"] } },
    captureRejections: {
        [READ]: {
            experimental: ["13.4.0", "12.16.0"],
            supported: ["17.4.0", "16.14.0"],
        },
    },
    captureRejectionSymbol: {
        [READ]: {
            experimental: ["13.4.0", "12.16.0"],
            supported: ["17.4.0", "16.14.0"],
        },
    },
    getEventListeners: { [READ]: { supported: ["15.2.0", "14.17.0"] } },
    getMaxListeners: { [READ]: { supported: ["19.9.0", "18.17.0"] } },
    once: { [READ]: { supported: ["11.13.0", "10.16.0"] } },
    listenerCount: { [READ]: { supported: ["0.9.12"], deprecated: ["3.2.0"] } },
    on: { [READ]: { supported: ["13.6.0", "12.16.0"] } },
    setMaxListeners: { [READ]: { supported: ["15.4.0"] } },
    addAbortListener: {
        [READ]: { experimental: ["20.5.0", "18.18.0"], supported: ["22.16.0"] },
    },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const events = {
    Event: { [READ]: { experimental: ["14.5.0"], supported: ["15.4.0"] } },
    EventTarget: {
        [READ]: {
            experimental: ["14.5.0"],
            supported: ["15.4.0"],
        },
    },
    CustomEvent: {
        [READ]: {
            experimental: ["18.7.0", "16.17.0"],
            supported: ["22.1.0", "20.13.0"],
        },
    },
    NodeEventTarget: {
        [READ]: {
            experimental: ["14.5.0"],
            supported: ["15.4.0"],
        },
    },
    EventEmitter: {
        [READ]: { supported: ["0.1.26"] },
        ...EventEmitterStatic,
    },
    EventEmitterAsyncResource: {
        [READ]: { supported: ["17.4.0", "16.14.0"] },
        ...EventEmitterStatic,
    },
    ...EventEmitterStatic,
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    events: {
        [READ]: { supported: ["0.1.26"] },
        ...events,
    },
    "node:events": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...events,
    },
}
