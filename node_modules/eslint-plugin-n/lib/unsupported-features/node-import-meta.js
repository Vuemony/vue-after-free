"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @type {import('./types.js').SupportVersionTraceMap}
 */
const importMeta = {
    resolve: {
        [READ]: {
            supported: ["18.19.0", "20.6.0"],
            experimental: ["12.16.2", "13.9.0"],
        },
    },
    dirname: {
        [READ]: {
            supported: ["21.2.0", "20.11.0", "22.16.0"],
        },
    },
    filename: {
        [READ]: {
            supported: ["21.2.0", "20.11.0", "22.16.0"],
        },
    },
    main: {
        [READ]: {
            experimental: ["22.18.0"],
        },
    },
}

module.exports = importMeta
