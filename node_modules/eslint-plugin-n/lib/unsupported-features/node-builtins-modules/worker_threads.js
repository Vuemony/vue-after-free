"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const worker_threads = {
    parentPort: { [READ]: { supported: ["10.5.0"] } },
    resourceLimits: { [READ]: { supported: ["13.2.0", "12.16.0"] } },
    SHARE_ENV: { [READ]: { supported: ["11.14.0"] } },
    threadId: { [READ]: { supported: ["10.5.0"] } },
    workerData: { [READ]: { supported: ["10.5.0"] } },
    getEnvironmentData: {
        [READ]: {
            experimental: ["15.12.0", "14.18.0"],
            supported: ["17.5.0", "16.15.0"],
        },
    },
    getHeapStatistics: {
        [READ]: {
            supported: ["22.16.0"],
        },
    },
    markAsUncloneable: { [READ]: { supported: ["23.0.0", "22.10.0"] } },
    markAsUntransferable: { [READ]: { supported: ["14.5.0", "12.19.0"] } },
    isInternalThread: { [READ]: { supported: ["22.14.0", "23.7.0"] } },
    isMainThread: { [READ]: { supported: ["10.5.0"] } },
    isMarkedAsUntransferable: { [READ]: { supported: ["21.0.0"] } },
    moveMessagePortToContext: { [READ]: { supported: ["11.13.0"] } },
    postMessageToThread: { [READ]: { experimental: ["22.5.0", "20.19.0"] } },
    receiveMessageOnPort: { [READ]: { supported: ["12.3.0"] } },
    setEnvironmentData: {
        [READ]: {
            experimental: ["15.12.0", "14.18.0"],
            supported: ["17.5.0", "16.15.0"],
        },
    },
    BroadcastChannel: {
        [READ]: { experimental: ["15.4.0"], supported: ["18.0.0"] },
    },
    MessageChannel: { [READ]: { supported: ["10.5.0"] } },
    MessagePort: { [READ]: { supported: ["10.5.0"] } },
    Worker: { [READ]: { supported: ["10.5.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    worker_threads: {
        ...worker_threads,
        [READ]: { supported: ["12.11.0"], experimental: ["10.5.0"] },
    },
    "node:worker_threads": {
        ...worker_threads,
        [READ]: { supported: ["14.13.1", "12.20.0"] },
    },
}
