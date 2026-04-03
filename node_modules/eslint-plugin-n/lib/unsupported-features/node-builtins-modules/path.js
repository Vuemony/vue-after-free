"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const path = {
    delimiter: { [READ]: { supported: ["0.9.3"] } },
    sep: { [READ]: { supported: ["0.7.9"] } },
    basename: { [READ]: { supported: ["0.1.25"] } },
    dirname: { [READ]: { supported: ["0.1.16"] } },
    extname: { [READ]: { supported: ["0.1.25"] } },
    format: { [READ]: { supported: ["0.11.15"] } },
    matchesGlob: { [READ]: { experimental: ["22.5.0", "20.17.0"] } },
    isAbsolute: { [READ]: { supported: ["0.11.2"] } },
    join: { [READ]: { supported: ["0.1.16"] } },
    normalize: { [READ]: { supported: ["0.1.23"] } },
    parse: { [READ]: { supported: ["0.11.15"] } },
    relative: { [READ]: { supported: ["0.5.0"] } },
    resolve: { [READ]: { supported: ["0.3.4"] } },
    toNamespacedPath: { [READ]: { supported: ["9.0.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    path: {
        [READ]: { supported: ["0.1.16"] },
        posix: { [READ]: { supported: ["0.11.15"] }, ...path },
        win32: { [READ]: { supported: ["0.11.15"] }, ...path },
        ...path,
    },
    "node:path": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        posix: { [READ]: { supported: ["0.11.15"] }, ...path },
        win32: { [READ]: { supported: ["0.11.15"] }, ...path },
        ...path,
    },

    "path/posix": { [READ]: { supported: ["15.3.0"] }, ...path },
    "node:path/posix": { [READ]: { supported: ["15.3.0"] }, ...path },

    "path/win32": { [READ]: { supported: ["15.3.0"] }, ...path },
    "node:path/win32": { [READ]: { supported: ["15.3.0"] }, ...path },
}
