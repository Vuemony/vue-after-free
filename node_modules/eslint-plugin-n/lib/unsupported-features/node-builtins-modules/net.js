"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const net = {
    connect: { [READ]: { supported: ["0.0.1"] } },
    createConnection: { [READ]: { supported: ["0.0.1"] } },
    createServer: { [READ]: { supported: ["0.5.0"] } },
    getDefaultAutoSelectFamily: { [READ]: { supported: ["19.4.0"] } },
    setDefaultAutoSelectFamily: { [READ]: { supported: ["19.4.0"] } },
    getDefaultAutoSelectFamilyAttemptTimeout: {
        [READ]: { supported: ["19.8.0", "18.18.0"] },
    },
    setDefaultAutoSelectFamilyAttemptTimeout: {
        [READ]: { supported: ["19.8.0", "18.18.0"] },
    },
    isIP: { [READ]: { supported: ["0.3.0"] } },
    isIPv4: { [READ]: { supported: ["0.3.0"] } },
    isIPv6: { [READ]: { supported: ["0.3.0"] } },
    BlockList: {
        [READ]: { supported: ["15.0.0", "14.18.0"] },
        isBlockList: { [READ]: { supported: ["22.13.0", "23.4.0"] } },
    },
    SocketAddress: {
        [READ]: { supported: ["15.14.0", "14.18.0"] },
        parse: { [READ]: { supported: ["22.13.0", "23.4.0"] } },
    },
    Server: { [READ]: { supported: ["0.1.90"] } },
    Socket: { [READ]: { supported: ["0.3.4"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    net: {
        [READ]: { supported: ["0.0.1"] },
        ...net,
    },
    "node:net": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...net,
    },
}
