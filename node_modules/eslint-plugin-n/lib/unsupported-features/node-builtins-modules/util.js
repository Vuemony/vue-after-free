"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const types = {
    [READ]: { supported: ["10.0.0"] },
    isExternal: { [READ]: { supported: ["10.0.0"] } },
    isDate: { [READ]: { supported: ["10.0.0"] } },
    isArgumentsObject: { [READ]: { supported: ["10.0.0"] } },
    isBigIntObject: { [READ]: { supported: ["10.0.0"] } },
    isBooleanObject: { [READ]: { supported: ["10.0.0"] } },
    isNumberObject: { [READ]: { supported: ["10.0.0"] } },
    isStringObject: { [READ]: { supported: ["10.0.0"] } },
    isSymbolObject: { [READ]: { supported: ["10.0.0"] } },
    isNativeError: { [READ]: { supported: ["10.0.0"] } },
    isRegExp: { [READ]: { supported: ["10.0.0"] } },
    isAsyncFunction: { [READ]: { supported: ["10.0.0"] } },
    isGeneratorFunction: { [READ]: { supported: ["10.0.0"] } },
    isGeneratorObject: { [READ]: { supported: ["10.0.0"] } },
    isPromise: { [READ]: { supported: ["10.0.0"] } },
    isMap: { [READ]: { supported: ["10.0.0"] } },
    isSet: { [READ]: { supported: ["10.0.0"] } },
    isMapIterator: { [READ]: { supported: ["10.0.0"] } },
    isSetIterator: { [READ]: { supported: ["10.0.0"] } },
    isWeakMap: { [READ]: { supported: ["10.0.0"] } },
    isWeakSet: { [READ]: { supported: ["10.0.0"] } },
    isArrayBuffer: { [READ]: { supported: ["10.0.0"] } },
    isDataView: { [READ]: { supported: ["10.0.0"] } },
    isSharedArrayBuffer: { [READ]: { supported: ["10.0.0"] } },
    isProxy: { [READ]: { supported: ["10.0.0"] } },
    isModuleNamespaceObject: { [READ]: { supported: ["10.0.0"] } },
    isAnyArrayBuffer: { [READ]: { supported: ["10.0.0"] } },
    isBoxedPrimitive: { [READ]: { supported: ["10.11.0"] } },
    isArrayBufferView: { [READ]: { supported: ["10.0.0"] } },
    isTypedArray: { [READ]: { supported: ["10.0.0"] } },
    isUint8Array: { [READ]: { supported: ["10.0.0"] } },
    isUint8ClampedArray: { [READ]: { supported: ["10.0.0"] } },
    isUint16Array: { [READ]: { supported: ["10.0.0"] } },
    isUint32Array: { [READ]: { supported: ["10.0.0"] } },
    isInt8Array: { [READ]: { supported: ["10.0.0"] } },
    isInt16Array: { [READ]: { supported: ["10.0.0"] } },
    isInt32Array: { [READ]: { supported: ["10.0.0"] } },
    isFloat16Array: { [READ]: { supported: ["22.16.0"] } },
    isFloat32Array: { [READ]: { supported: ["10.0.0"] } },
    isFloat64Array: { [READ]: { supported: ["10.0.0"] } },
    isBigInt64Array: { [READ]: { supported: ["10.0.0"] } },
    isBigUint64Array: { [READ]: { supported: ["10.0.0"] } },
    isKeyObject: { [READ]: { supported: ["16.2.0"] } },
    isCryptoKey: { [READ]: { supported: ["16.2.0"] } },
    isWebAssemblyCompiledModule: {
        [READ]: { supported: ["10.0.0"], deprecated: ["14.0.0"] },
    },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const deprecated = {
    _extend: { [READ]: { supported: ["0.7.5"], deprecated: ["6.0.0"] } },
    isArray: { [READ]: { supported: ["0.6.0"], deprecated: ["4.0.0"] } },
    isBoolean: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isBuffer: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isDate: { [READ]: { supported: ["0.6.0"], deprecated: ["4.0.0"] } },
    isError: { [READ]: { supported: ["0.6.0"], deprecated: ["4.0.0"] } },
    isFunction: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isNull: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isNullOrUndefined: {
        [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] },
    },
    isNumber: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isObject: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isPrimitive: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isRegExp: { [READ]: { supported: ["0.6.0"], deprecated: ["4.0.0"] } },
    isString: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isSymbol: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    isUndefined: { [READ]: { supported: ["0.11.5"], deprecated: ["4.0.0"] } },
    log: { [READ]: { supported: ["0.3.0"], deprecated: ["6.0.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const util = {
    promisify: {
        [READ]: { supported: ["8.0.0"] },
        custom: { [READ]: { supported: ["8.0.0"] } },
    },
    callbackify: { [READ]: { supported: ["8.2.0"] } },

    debuglog: { [READ]: { supported: ["0.11.3"] } },
    debug: { [READ]: { supported: ["14.9.0"] } },
    deprecate: { [READ]: { supported: ["0.8.0"] } },
    diff: { [READ]: { experimental: ["22.15.0", "23.11.0"] } },
    format: { [READ]: { supported: ["0.5.3"] } },
    formatWithOptions: { [READ]: { supported: ["10.0.0"] } },
    getCallSite: {
        [READ]: { deprecated: ["23.3.0", "22.12.0"], experimental: ["22.9.0"] },
    },
    getCallSites: { [READ]: { experimental: ["23.3.0", "22.12.0"] } },
    getSystemErrorName: { [READ]: { supported: ["9.7.0", "8.12.0"] } },
    getSystemErrorMap: { [READ]: { supported: ["16.0.0", "14.17.0"] } },
    getSystemErrorMessage: { [READ]: { supported: ["23.1.0", "22.12.0"] } },
    inherits: { [READ]: { supported: ["0.3.0"] } },
    inspect: {
        [READ]: { supported: ["0.3.0"] },
        custom: { [READ]: { supported: ["6.6.0"] } },
        defaultOptions: { [READ]: { supported: ["6.4.0"] } },
        replDefaults: { [READ]: { supported: ["11.12.0"] } },
    },
    isDeepStrictEqual: { [READ]: { supported: ["9.0.0"] } },
    parseArgs: {
        [READ]: { experimental: ["18.3.0", "16.17.0"], supported: ["20.0.0"] },
    },
    parseEnv: { [READ]: { supported: ["20.12.0", "21.7.0"] } },
    setTraceSigInt: { [READ]: { supported: ["22.19.0"] } },
    stripVTControlCharacters: { [READ]: { supported: ["16.11.0"] } },
    styleText: {
        [READ]: { supported: ["20.12.0", "21.7.0", "22.13.0", "23.5.0"] },
    },
    toUSVString: { [READ]: { supported: ["16.8.0", "14.18.0"] } },
    transferableAbortController: {
        [READ]: {
            experimental: ["18.11.0"],
            supported: ["22.15.0", "23.11.0"],
        },
    },
    transferableAbortSignal: {
        [READ]: {
            experimental: ["18.11.0"],
            supported: ["22.15.0", "23.11.0"],
        },
    },
    aborted: {
        [READ]: { experimental: ["19.7.0", "18.16.0"], supported: ["22.16.0"] },
    },
    MIMEType: {
        [READ]: {
            experimental: ["19.1.0", "18.13.0"],
            supported: ["22.15.0", "23.11.0"],
        },
    },
    MIMEParams: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
    TextDecoder: { [READ]: { experimental: ["8.3.0"], supported: ["8.9.0"] } },
    TextEncoder: { [READ]: { experimental: ["8.3.0"], supported: ["8.9.0"] } },

    types,
    ...deprecated,
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    util: util,
    "node:util": { ...util, [READ]: { supported: ["14.13.1", "12.20.0"] } },
    "util/types": { ...types, [READ]: { supported: ["15.3.0"] } },
    "node:util/types": { ...types, [READ]: { supported: ["15.3.0"] } },
}
