"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const dns = {
    Resolver: { [READ]: { supported: ["8.3.0"] } },
    getServers: { [READ]: { supported: ["0.11.3"] } },
    lookup: { [READ]: { supported: ["0.1.90"] } },
    lookupService: { [READ]: { supported: ["0.11.14"] } },
    resolve: { [READ]: { supported: ["0.1.27"] } },
    resolve4: { [READ]: { supported: ["0.1.16"] } },
    resolve6: { [READ]: { supported: ["0.1.16"] } },
    resolveAny: { [READ]: { supported: ["0.1.16"] } },
    resolveCname: { [READ]: { supported: ["0.3.2"] } },
    resolveCaa: { [READ]: { supported: ["15.0.0", "14.17.0"] } },
    resolveMx: { [READ]: { supported: ["0.1.27"] } },
    resolveNaptr: { [READ]: { supported: ["0.9.12"] } },
    resolveNs: { [READ]: { supported: ["0.1.90"] } },
    resolvePtr: { [READ]: { supported: ["6.0.0"] } },
    resolveSoa: { [READ]: { supported: ["0.11.10"] } },
    resolveSrv: { [READ]: { supported: ["0.1.27"] } },
    resolveTlsa: { [READ]: { supported: ["22.15.0", "23.9.0"] } },
    resolveTxt: { [READ]: { supported: ["0.1.27"] } },
    reverse: { [READ]: { supported: ["0.1.16"] } },
    setDefaultResultOrder: { [READ]: { supported: ["16.4.0", "14.18.0"] } },
    getDefaultResultOrder: { [READ]: { supported: ["20.1.0", "18.17.0"] } },
    setServers: { [READ]: { supported: ["0.11.3"] } },

    promises: {
        [READ]: {
            experimental: ["10.6.0"],
            supported: ["11.14.0", "10.17.0"],
        },
        Resolver: { [READ]: { supported: ["10.6.0"] } },
        cancel: { [READ]: { supported: ["15.3.0", "14.17.0"] } },
        getServers: { [READ]: { supported: ["10.6.0"] } },
        lookup: { [READ]: { supported: ["10.6.0"] } },
        lookupService: { [READ]: { supported: ["10.6.0"] } },
        resolve: { [READ]: { supported: ["10.6.0"] } },
        resolve4: { [READ]: { supported: ["10.6.0"] } },
        resolve6: { [READ]: { supported: ["10.6.0"] } },
        resolveAny: { [READ]: { supported: ["10.6.0"] } },
        resolveCaa: { [READ]: { supported: ["15.0.0", "14.17.0"] } },
        resolveCname: { [READ]: { supported: ["10.6.0"] } },
        resolveMx: { [READ]: { supported: ["10.6.0"] } },
        resolveNaptr: { [READ]: { supported: ["10.6.0"] } },
        resolveNs: { [READ]: { supported: ["10.6.0"] } },
        resolvePtr: { [READ]: { supported: ["10.6.0"] } },
        resolveSoa: { [READ]: { supported: ["10.6.0"] } },
        resolveSrv: { [READ]: { supported: ["10.6.0"] } },
        resolveTlsa: { [READ]: { supported: ["22.15.0", "23.9.0"] } },
        resolveTxt: { [READ]: { supported: ["10.6.0"] } },
        reverse: { [READ]: { supported: ["10.6.0"] } },
        setDefaultResultOrder: { [READ]: { supported: ["16.4.0", "14.18.0"] } },
        getDefaultResultOrder: { [READ]: { supported: ["20.1.0", "18.17.0"] } },
        setServers: { [READ]: { supported: ["10.6.0"] } },
    },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    dns: { ...dns, [READ]: { supported: ["0.1.16"] } },
    "node:dns": { ...dns, [READ]: { supported: ["14.13.1", "12.20.0"] } },

    "dns/promises": { ...dns.promises, [READ]: { supported: ["15.0.0"] } },
    "node:dns/promises": { ...dns.promises, [READ]: { supported: ["15.0.0"] } },
}
