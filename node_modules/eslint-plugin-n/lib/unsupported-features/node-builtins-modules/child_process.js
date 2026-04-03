"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const child_process = {
    exec: { [READ]: { supported: ["0.1.90"] } },
    execFile: { [READ]: { supported: ["0.1.91"] } },
    fork: { [READ]: { supported: ["0.5.0"] } },
    spawn: { [READ]: { supported: ["0.1.90"] } },
    execFileSync: { [READ]: { supported: ["0.11.12"] } },
    execSync: { [READ]: { supported: ["0.11.12"] } },
    spawnSync: { [READ]: { supported: ["0.11.12"] } },
    ChildProcess: { [READ]: { supported: ["2.2.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    child_process: {
        [READ]: { supported: ["0.1.90"] },
        ...child_process,
    },
    "node:child_process": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...child_process,
    },
}
