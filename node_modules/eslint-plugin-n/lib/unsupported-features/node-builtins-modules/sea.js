"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const sea = {
    isSea: { [READ]: { supported: ["21.7.0", "20.12.0"] } },
    getAsset: { [READ]: { supported: ["21.7.0", "20.12.0"] } },
    getAssetAsBlob: { [READ]: { supported: ["21.7.0", "20.12.0"] } },
    getRawAsset: { [READ]: { supported: ["21.7.0", "20.12.0"] } },
    sea: {},
}

sea.sea = sea

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    "node:sea": {
        [READ]: { experimental: ["21.7.0", "20.12.0"] },
        ...sea,
    },
}
