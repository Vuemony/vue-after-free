"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const url = {
    domainToASCII: { [READ]: { supported: ["7.4.0", "6.13.0"] } },
    domainToUnicode: { [READ]: { supported: ["7.4.0", "6.13.0"] } },
    fileURLToPath: { [READ]: { supported: ["10.12.0"] } },
    format: { [READ]: { supported: ["7.6.0"] } },
    pathToFileURL: { [READ]: { supported: ["10.12.0"] } },
    urlToHttpOptions: { [READ]: { supported: ["15.7.0", "14.18.0"] } },
    URL: {
        [READ]: { supported: ["7.0.0", "6.13.0"] },
        canParse: { [READ]: { supported: ["19.9.0"] } },
        createObjectURL: {
            [READ]: { experimental: ["16.7.0"], supported: ["22.17.0"] },
        },
        revokeObjectURL: {
            [READ]: { experimental: ["16.7.0"], supported: ["22.17.0"] },
        },
    },
    URLPattern: { [READ]: { experimental: ["23.8.0"] } },
    URLSearchParams: { [READ]: { supported: ["7.5.0", "6.13.0"] } },
    Url: { [READ]: { supported: ["0.1.25"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    url: {
        [READ]: { supported: ["0.1.25"] },
        ...url,
    },
    "node:url": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...url,
    },
}
