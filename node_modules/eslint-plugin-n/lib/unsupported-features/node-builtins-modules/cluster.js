"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const cluster = {
    isMaster: { [READ]: { supported: ["0.8.1"], deprecated: ["16.0.0"] } },
    isPrimary: { [READ]: { supported: ["16.0.0"] } },
    isWorker: { [READ]: { supported: ["0.6.0"] } },
    schedulingPolicy: { [READ]: { supported: ["0.11.2"] } },
    settings: { [READ]: { supported: ["0.7.1"] } },
    worker: { [READ]: { supported: ["0.7.0"] } },
    workers: { [READ]: { supported: ["0.7.0"] } },
    disconnect: { [READ]: { supported: ["0.7.7"] } },
    fork: { [READ]: { supported: ["0.6.0"] } },
    setupMaster: { [READ]: { supported: ["0.7.1"], deprecated: ["16.0.0"] } },
    setupPrimary: { [READ]: { supported: ["16.0.0"] } },
    Worker: { [READ]: { supported: ["0.7.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    cluster: {
        [READ]: { supported: ["0.7.0"] },
        ...cluster,
    },
    "node:cluster": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...cluster,
    },
}
