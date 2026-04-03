"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const os = {
    EOL: { [READ]: { supported: ["0.7.8"] } },
    constants: {
        [READ]: { supported: ["5.11.0", "6.3.0"] },
        priority: { [READ]: { supported: ["10.10.0"] } },
    },
    devNull: { [READ]: { supported: ["16.3.0", "14.18.0"] } },
    availableParallelism: { [READ]: { supported: ["19.4.0", "18.14.0"] } },
    arch: { [READ]: { supported: ["0.5.0"] } },
    cpus: { [READ]: { supported: ["0.3.3"] } },
    endianness: { [READ]: { supported: ["0.9.4"] } },
    freemem: { [READ]: { supported: ["0.3.3"] } },
    getPriority: { [READ]: { supported: ["10.10.0"] } },
    homedir: { [READ]: { supported: ["2.3.0"] } },
    hostname: { [READ]: { supported: ["0.3.3"] } },
    loadavg: { [READ]: { supported: ["0.3.3"] } },
    machine: { [READ]: { supported: ["18.9.0", "16.18.0"] } },
    networkInterfaces: { [READ]: { supported: ["0.6.0"] } },
    platform: { [READ]: { supported: ["0.5.0"] } },
    release: { [READ]: { supported: ["0.3.3"] } },
    setPriority: { [READ]: { supported: ["10.10.0"] } },
    tmpdir: { [READ]: { supported: ["0.9.9"] } },
    totalmem: { [READ]: { supported: ["0.3.3"] } },
    type: { [READ]: { supported: ["0.3.3"] } },
    uptime: { [READ]: { supported: ["0.3.3"] } },
    userInfo: { [READ]: { supported: ["6.0.0"] } },
    version: { [READ]: { supported: ["13.11.0", "12.17.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    os: {
        [READ]: { supported: ["0.3.3"] },
        ...os,
    },
    "node:os": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...os,
    },
}
