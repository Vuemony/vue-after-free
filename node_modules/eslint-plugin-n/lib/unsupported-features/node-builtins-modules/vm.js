"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const vm = {
    constants: { [READ]: { supported: ["20.12.0", "21.7.0"] } },
    compileFunction: { [READ]: { supported: ["10.10.0"] } },
    createContext: { [READ]: { supported: ["0.3.1"] } },
    isContext: { [READ]: { supported: ["0.11.7"] } },
    measureMemory: { [READ]: { experimental: ["13.10.0"] } },
    runInContext: { [READ]: { supported: ["0.3.1"] } },
    runInNewContext: { [READ]: { supported: ["0.3.1"] } },
    runInThisContext: { [READ]: { supported: ["0.3.1"] } },
    Script: { [READ]: { supported: ["0.3.1"] } },
    // Module was not found in v10 or v11.
    Module: { [READ]: { experimental: ["13.0.0", "12.16.0", "9.6.0"] } },
    SourceTextModule: { [READ]: { experimental: ["9.6.0"] } },
    SyntheticModule: { [READ]: { experimental: ["13.0.0", "12.16.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    vm: vm,
    "node:vm": { ...vm, [READ]: { supported: ["14.13.1", "12.20.0"] } },
}
