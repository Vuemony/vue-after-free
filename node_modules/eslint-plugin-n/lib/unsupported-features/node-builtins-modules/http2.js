"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const http2 = {
    constants: { [READ]: { supported: ["8.4.0"] } },
    sensitiveHeaders: { [READ]: { supported: ["15.0.0", "14.18.0"] } },
    createServer: { [READ]: { supported: ["8.4.0"] } },
    createSecureServer: { [READ]: { supported: ["8.4.0"] } },
    connect: { [READ]: { supported: ["8.4.0"] } },
    getDefaultSettings: { [READ]: { supported: ["8.4.0"] } },
    getPackedSettings: { [READ]: { supported: ["8.4.0"] } },
    getUnpackedSettings: { [READ]: { supported: ["8.4.0"] } },
    performServerHandshake: { [READ]: { supported: ["20.12.0", "21.7.0"] } },
    Http2Session: { [READ]: { supported: ["8.4.0"] } },
    ServerHttp2Session: { [READ]: { supported: ["8.4.0"] } },
    ClientHttp2Session: { [READ]: { supported: ["8.4.0"] } },
    Http2Stream: { [READ]: { supported: ["8.4.0"] } },
    ClientHttp2Stream: { [READ]: { supported: ["8.4.0"] } },
    ServerHttp2Stream: { [READ]: { supported: ["8.4.0"] } },
    Http2Server: { [READ]: { supported: ["8.4.0"] } },
    Http2SecureServer: { [READ]: { supported: ["8.4.0"] } },
    Http2ServerRequest: { [READ]: { supported: ["8.4.0"] } },
    Http2ServerResponse: { [READ]: { supported: ["8.4.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    http2: {
        [READ]: {
            experimental: ["8.4.0"],
            supported: ["10.10.0", "8.13.0"],
        },
        ...http2,
    },
    "node:http2": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...http2,
    },
}
