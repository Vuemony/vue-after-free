"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const domain = {
    create: { [READ]: { supported: ["0.7.8"] } },
    Domain: { [READ]: { supported: ["0.7.8"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    domain: {
        [READ]: {
            supported: ["0.7.8"],
            deprecated: ["1.4.2"],
        },
        ...domain,
    },
}
