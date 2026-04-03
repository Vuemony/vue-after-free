"use strict"

const { CONSTRUCT, READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const buffer = {
    constants: { [READ]: { supported: ["8.2.0"] } },
    INSPECT_MAX_BYTES: { [READ]: { supported: ["0.5.4"] } },
    kMaxLength: { [READ]: { supported: ["3.0.0"] } },
    kStringMaxLength: { [READ]: { supported: ["3.0.0"] } },
    atob: { [READ]: { supported: ["15.13.0", "14.17.0"] } },
    btoa: { [READ]: { supported: ["15.13.0", "14.17.0"] } },
    isAscii: { [READ]: { supported: ["19.6.0", "18.15.0"] } },
    isUtf8: { [READ]: { supported: ["19.4.0", "18.14.0"] } },
    resolveObjectURL: { [READ]: { experimental: ["16.7.0"] } },
    transcode: { [READ]: { supported: ["7.1.0"] } },
    SlowBuffer: { [READ]: { supported: ["0.1.90"], deprecated: ["6.0.0"] } },
    Blob: {
        [READ]: {
            experimental: ["15.7.0", "14.18.0"],
            supported: ["18.0.0", "16.17.0"],
        },
    },
    Buffer: {
        [READ]: { supported: ["0.1.90"] },
        [CONSTRUCT]: { supported: ["0.1.90"], deprecated: ["6.0.0"] },
        alloc: { [READ]: { supported: ["5.10.0", "4.5.0"] } },
        allocUnsafe: { [READ]: { supported: ["5.10.0", "4.5.0"] } },
        allocUnsafeSlow: { [READ]: { supported: ["5.12.0", "4.5.0"] } },
        byteLength: { [READ]: { supported: ["0.1.90"] } },
        compare: { [READ]: { supported: ["0.11.13"] } },
        concat: { [READ]: { supported: ["0.7.11"] } },
        copyBytesFrom: { [READ]: { supported: ["19.8.0", "18.16.0"] } },
        from: { [READ]: { supported: ["5.10.0", "4.5.0"] } },
        isBuffer: { [READ]: { supported: ["0.1.101"] } },
        isEncoding: { [READ]: { supported: ["0.9.1"] } },
    },
    File: {
        [READ]: {
            experimental: ["19.2.0", "18.13.0"],
            supported: ["20.0.0"],
        },
    },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    buffer: {
        [READ]: { supported: ["0.1.90"] },
        ...buffer,
    },
    "node:buffer": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...buffer,
    },
}
