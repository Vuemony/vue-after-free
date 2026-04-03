"use strict"

const { CALL, READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const repl = {
    start: {
        [READ]: { supported: ["0.1.91"] },
    },
    writer: {
        [READ]: { supported: ["0.1.91"] },
    },
    REPLServer: {
        [READ]: { supported: ["0.1.91"] },
        [CALL]: { deprecated: ["22.9.0"] },
    },
    REPL_MODE_MAGIC: {
        [READ]: {
            supported: ["4.0.0"],
            deprecated: ["8.0.0"],
            // removed: ['10.0.0'],
        },
    },
    REPL_MODE_SLOPPY: {
        [READ]: { supported: ["4.0.0"] },
    },
    REPL_MODE_STRICT: {
        [READ]: { supported: ["4.0.0"] },
    },
    Recoverable: {
        [READ]: { supported: ["6.2.0"] },
        [CALL]: { deprecated: ["22.9.0"] },
    },
    builtinModules: {
        [READ]: { supported: ["14.5.0"], deprecated: ["22.16.0"] },
    },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    repl: {
        [READ]: { supported: ["0.1.91"] },
        ...repl,
    },
    "node:repl": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...repl,
    },
}
