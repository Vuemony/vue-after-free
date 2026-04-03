"use strict"

const { CALL, CONSTRUCT, READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const WebCrypto = {
    [READ]: { experimental: ["15.0.0"], supported: ["19.0.0"] },
    subtle: {
        [READ]: { supported: ["15.0.0"] },
        decrypt: { [READ]: { supported: ["15.0.0"] } },
        deriveBits: { [READ]: { supported: ["15.0.0"] } },
        deriveKey: { [READ]: { supported: ["15.0.0"] } },
        digest: { [READ]: { supported: ["15.0.0"] } },
        encrypt: { [READ]: { supported: ["15.0.0"] } },
        exportKey: { [READ]: { supported: ["15.0.0"] } },
        generateKey: { [READ]: { supported: ["15.0.0"] } },
        importKey: { [READ]: { supported: ["15.0.0"] } },
        sign: { [READ]: { supported: ["15.0.0"] } },
        unwrapKey: { [READ]: { supported: ["15.0.0"] } },
        verify: { [READ]: { supported: ["15.0.0"] } },
        wrapKey: { [READ]: { supported: ["15.0.0"] } },
    },
    getRandomValues: { [READ]: { supported: ["15.0.0"] } },
    randomUUID: { [READ]: { supported: ["16.7.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const crypto = {
    constants: { [READ]: { supported: ["6.3.0"] } },
    fips: { [READ]: { supported: ["6.0.0"], deprecated: ["10.0.0"] } },

    webcrypto: WebCrypto,
    subtle: {
        ...WebCrypto.subtle,
        [READ]: { experimental: ["17.4.0"], supported: ["19.0.0"] },
    },

    // methods and properties
    checkPrime: { [READ]: { supported: ["15.8.0"] } },
    checkPrimeSync: { [READ]: { supported: ["15.8.0"] } },
    createCipher: { [READ]: { supported: ["0.1.94"], deprecated: ["10.0.0"] } },
    createCipheriv: { [READ]: { supported: ["0.1.94"] } },
    createDecipher: {
        [READ]: { supported: ["0.1.94"], deprecated: ["10.0.0"] },
    },
    createDecipheriv: { [READ]: { supported: ["0.1.94"] } },
    createDiffieHellman: { [READ]: { supported: ["0.11.12"] } },
    createDiffieHellmanGroup: { [READ]: { supported: ["0.9.3"] } },
    createECDH: { [READ]: { supported: ["0.11.14"] } },
    createHash: { [READ]: { supported: ["0.1.92"] } },
    createHmac: { [READ]: { supported: ["0.1.94"] } },
    createPrivateKey: { [READ]: { supported: ["11.6.0"] } },
    createPublicKey: { [READ]: { supported: ["11.6.0"] } },
    createSecretKey: { [READ]: { supported: ["11.6.0"] } },
    createSign: { [READ]: { supported: ["0.1.92"] } },
    createVerify: { [READ]: { supported: ["0.1.92"] } },
    diffieHellman: { [READ]: { supported: ["13.9.0", "12.17.0"] } },
    generateKey: { [READ]: { supported: ["15.0.0"] } },
    generateKeyPair: { [READ]: { supported: ["10.12.0"] } },
    generateKeyPairSync: { [READ]: { supported: ["10.12.0"] } },
    generateKeySync: { [READ]: { supported: ["15.0.0"] } },
    generatePrime: { [READ]: { supported: ["15.8.0"] } },
    generatePrimeSync: { [READ]: { supported: ["15.8.0"] } },
    getCipherInfo: { [READ]: { supported: ["15.0.0"] } },
    getCiphers: { [READ]: { supported: ["0.9.3"] } },
    getCurves: { [READ]: { supported: ["2.3.0"] } },
    getDiffieHellman: { [READ]: { supported: ["0.7.5"] } },
    getFips: { [READ]: { supported: ["10.0.0"] } },
    getHashes: { [READ]: { supported: ["0.9.3"] } },
    getRandomValues: { [READ]: { supported: ["17.4.0"] } },
    hash: { [READ]: { supported: ["20.12.0", "21.7.0"] } },
    hkdf: { [READ]: { supported: ["15.0.0"] } },
    hkdfSync: { [READ]: { supported: ["15.0.0"] } },
    pbkdf2: { [READ]: { supported: ["0.5.5"] } },
    pbkdf2Sync: { [READ]: { supported: ["0.9.3"] } },
    privateDecrypt: { [READ]: { supported: ["0.11.14"] } },
    privateEncrypt: { [READ]: { supported: ["1.1.0"] } },
    publicDecrypt: { [READ]: { supported: ["1.1.0"] } },
    publicEncrypt: { [READ]: { supported: ["0.11.14"] } },
    randomBytes: { [READ]: { supported: ["0.5.8"] } },
    randomFillSync: { [READ]: { supported: ["7.10.0", "6.13.0"] } },
    randomFill: { [READ]: { supported: ["7.10.0", "6.13.0"] } },
    randomInt: { [READ]: { supported: ["14.10.0", "12.19.0"] } },
    randomUUID: { [READ]: { supported: ["15.6.0", "14.17.0"] } },
    scrypt: { [READ]: { supported: ["10.5.0"] } },
    scryptSync: { [READ]: { supported: ["10.5.0"] } },
    secureHeapUsed: { [READ]: { supported: ["15.6.0"] } },
    setEngine: { [READ]: { supported: ["0.11.11"] } },
    setFips: { [READ]: { supported: ["10.0.0"] } },
    sign: { [READ]: { supported: ["12.0.0"] } },
    timingSafeEqual: { [READ]: { supported: ["6.6.0"] } },
    verify: { [READ]: { supported: ["12.0.0"] } },

    // Classes
    Certificate: {
        [READ]: { supported: ["0.11.8"] },
        exportChallenge: { [READ]: { supported: ["9.0.0"] } },
        exportPublicKey: { [READ]: { supported: ["9.0.0"] } },
        verifySpkac: { [READ]: { supported: ["9.0.0"] } },
    },
    Cipher: { [READ]: { supported: ["0.1.94"] } },
    Decipher: { [READ]: { supported: ["0.1.94"] } },
    DiffieHellman: { [READ]: { supported: ["0.5.0"] } },
    DiffieHellmanGroup: { [READ]: { supported: ["0.7.5"] } },
    ECDH: {
        [READ]: { supported: ["0.11.14"] },
        convertKey: { [READ]: { supported: ["10.0.0"] } },
    },
    Hash: {
        [READ]: { supported: ["0.1.92"] },
        [CALL]: { deprecated: ["22.0.0", "20.13.0"] },
        [CONSTRUCT]: { deprecated: ["22.0.0", "20.13.0"] },
    },
    Hmac: {
        [READ]: { supported: ["0.1.94"] },
        [CALL]: { deprecated: ["22.0.0", "20.13.0"] },
        [CONSTRUCT]: { deprecated: ["22.0.0", "20.13.0"] },
    },
    KeyObject: {
        [READ]: { supported: ["11.6.0"] },
        from: { [READ]: { supported: ["15.0.0"] } },
    },
    Sign: { [READ]: { supported: ["0.1.92"] } },
    Verify: { [READ]: { supported: ["0.1.92"] } },
    X509Certificate: { [READ]: { supported: ["15.6.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    crypto: {
        [READ]: { supported: ["0.1.92"] },
        ...crypto,
    },
    "node:crypto": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...crypto,
    },
}
