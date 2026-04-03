"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const console = {
    profile: { [READ]: { supported: ["8.0.0"] } },
    profileEnd: { [READ]: { supported: ["8.0.0"] } },
    timeStamp: { [READ]: { supported: ["8.0.0"] } },
    Console: { [READ]: { supported: ["0.1.100"] } },
    assert: { [READ]: { supported: ["0.1.101"] } },
    clear: { [READ]: { supported: ["8.3.0", "6.13.0"] } },
    count: { [READ]: { supported: ["8.3.0", "6.13.0"] } },
    countReset: { [READ]: { supported: ["8.3.0", "6.13.0"] } },
    debug: { [READ]: { supported: ["8.0.0"] } },
    dir: { [READ]: { supported: ["0.1.101"] } },
    dirxml: { [READ]: { supported: ["8.0.0"] } },
    error: { [READ]: { supported: ["0.1.100"] } },
    group: { [READ]: { supported: ["8.5.0"] } },
    groupCollapsed: { [READ]: { supported: ["8.5.0"] } },
    groupEnd: { [READ]: { supported: ["8.5.0"] } },
    info: { [READ]: { supported: ["0.1.100"] } },
    log: { [READ]: { supported: ["0.1.100"] } },
    table: { [READ]: { supported: ["10.0.0"] } },
    time: { [READ]: { supported: ["0.1.104"] } },
    timeEnd: { [READ]: { supported: ["0.1.104"] } },
    timeLog: { [READ]: { supported: ["10.7.0"] } },
    trace: { [READ]: { supported: ["0.1.104"] } },
    warn: { [READ]: { supported: ["0.1.100"] } },

    // In original but cant find
    // markTimeline: { [READ]: { supported: ["8.0.0"] } },
    // timeline: { [READ]: { supported: ["8.0.0"] } },
    // timelineEnd: { [READ]: { supported: ["8.0.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    console: {
        [READ]: { supported: ["0.1.100"] },
        ...console,
    },
    "node:console": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...console,
    },
}
