"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const http = {
    METHODS: { [READ]: { supported: ["0.11.8"] } },
    STATUS_CODES: { [READ]: { supported: ["0.1.22"] } },
    globalAgent: { [READ]: { supported: ["0.5.9"] } },
    maxHeaderSize: { [READ]: { supported: ["11.6.0", "10.15.0"] } },
    createServer: { [READ]: { supported: ["0.1.13"] } },
    get: { [READ]: { supported: ["0.3.6"] } },
    request: { [READ]: { supported: ["0.3.6"] } },
    validateHeaderName: { [READ]: { supported: ["14.3.0"] } },
    validateHeaderValue: { [READ]: { supported: ["14.3.0"] } },
    setMaxIdleHTTPParsers: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
    Agent: { [READ]: { supported: ["0.3.4"] } },
    ClientRequest: { [READ]: { supported: ["0.1.17"] } },
    Server: { [READ]: { supported: ["0.1.17"] } },
    ServerResponse: { [READ]: { supported: ["0.1.17"] } },
    IncomingMessage: { [READ]: { supported: ["0.1.17"] } },
    OutgoingMessage: { [READ]: { supported: ["0.1.17"] } },
    WebSocket: { [READ]: { supported: ["22.5.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    http: {
        [READ]: { supported: ["0.0.1"] },
        ...http,
    },
    "node:http": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...http,
    },
    "node:_http_agent": {
        [READ]: { deprecated: ["22.19.0"] },
    },
    "node:_http_client": {
        [READ]: { deprecated: ["22.19.0"] },
    },
    "node:_http_common": {
        [READ]: { deprecated: ["22.19.0"] },
    },
    "node:_http_incoming": {
        [READ]: { deprecated: ["22.19.0"] },
    },
    "node:_http_outgoing": {
        [READ]: { deprecated: ["22.19.0"] },
    },
    "node:_http_server": {
        [READ]: { deprecated: ["22.19.0"] },
    },
}
