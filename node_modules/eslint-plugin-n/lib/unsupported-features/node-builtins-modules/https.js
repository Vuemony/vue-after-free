"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const https = {
    globalAgent: { [READ]: { supported: ["0.5.9"] } },
    createServer: { [READ]: { supported: ["0.3.4"] } },
    get: { [READ]: { supported: ["0.3.6"] } },
    request: { [READ]: { supported: ["0.3.6"] } },
    Agent: { [READ]: { supported: ["0.4.5"] } },
    Server: { [READ]: { supported: ["0.3.4"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    https: {
        [READ]: { supported: ["0.3.4"] },
        ...https,
    },
    "node:https": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...https,
    },
}
