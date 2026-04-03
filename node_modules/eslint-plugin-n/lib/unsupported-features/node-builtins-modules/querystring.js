"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const querystring = {
    decode: { [READ]: { supported: ["0.1.99"] } },
    encode: { [READ]: { supported: ["0.1.99"] } },
    escape: { [READ]: { supported: ["0.1.25"] } },
    parse: { [READ]: { supported: ["0.1.25"] } },
    stringify: { [READ]: { supported: ["0.1.25"] } },
    unescape: { [READ]: { supported: ["0.1.25"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    querystring: {
        [READ]: { supported: ["0.1.25"] },
        ...querystring,
    },
    "node:querystring": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...querystring,
    },
}
