"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const punycode = {
    ucs2: { [READ]: { supported: ["0.7.0"] } },
    version: { [READ]: { supported: ["0.6.1"] } },
    decode: { [READ]: { supported: ["0.5.1"] } },
    encode: { [READ]: { supported: ["0.5.1"] } },
    toASCII: { [READ]: { supported: ["0.6.1"] } },
    toUnicode: { [READ]: { supported: ["0.6.1"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    punycode: {
        [READ]: {
            supported: ["0.5.1"],
            deprecated: ["7.0.0"],
        },
        ...punycode,
    },
}
