"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const dgram = {
    createSocket: { [READ]: { supported: ["0.1.99"] } },
    Socket: { [READ]: { supported: ["0.1.99"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    dgram: {
        [READ]: { supported: ["0.1.99"] },
        ...dgram,
    },
    "node:dgram": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...dgram,
    },
}
