"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const Readable = {
    [READ]: { supported: ["0.9.4"] },
    from: { [READ]: { supported: ["12.3.0", "10.17.0"] } },
    isDisturbed: {
        [READ]: { experimental: ["16.8.0"], supported: ["22.17.0"] },
    },
    fromWeb: { [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] } },
    toWeb: { [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const Writable = {
    [READ]: { supported: ["0.9.4"] },
    fromWeb: { [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] } },
    toWeb: { [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const Duplex = {
    [READ]: { supported: ["0.9.4"] },
    from: { [READ]: { supported: ["16.8.0"] } },
    fromWeb: { [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] } },
    toWeb: { [READ]: { experimental: ["17.0.0"], supported: ["22.17.0"] } },
}

const Transform = Duplex

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const StreamPromise = {
    pipeline: { [READ]: { supported: ["15.0.0"] } },
    finished: { [READ]: { supported: ["15.0.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const Stream = {
    promises: {
        [READ]: { supported: ["15.0.0"] },
        ...StreamPromise,
    },
    finished: { [READ]: { supported: ["10.0.0"] } },
    pipeline: { [READ]: { supported: ["10.0.0"] } },
    compose: { [READ]: { supported: ["16.9.0"] } },
    duplexPair: { [READ]: { supported: ["22.6.0", "20.17.0"] } },

    Readable,
    Writable,
    Duplex,
    Transform,

    isErrored: {
        [READ]: { experimental: ["17.3.0", "16.14.0"], supported: ["22.17.0"] },
    },
    isReadable: {
        [READ]: { experimental: ["17.4.0", "16.14.0"], supported: ["22.17.0"] },
    },
    addAbortSignal: { [READ]: { supported: ["15.4.0"] } },
    getDefaultHighWaterMark: { [READ]: { supported: ["19.9.0", "18.17.0"] } },
    setDefaultHighWaterMark: { [READ]: { supported: ["19.9.0", "18.17.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const WebStream = {
    ReadableStream: {
        [READ]: { supported: ["16.5.0"] },
        from: { [READ]: { supported: ["20.6.0"] } },
    },
    ReadableStreamDefaultReader: { [READ]: { supported: ["16.5.0"] } },
    ReadableStreamBYOBReader: { [READ]: { supported: ["16.5.0"] } },
    ReadableStreamDefaultController: { [READ]: { supported: ["16.5.0"] } },
    ReadableByteStreamController: { [READ]: { supported: ["16.5.0"] } },
    ReadableStreamBYOBRequest: { [READ]: { supported: ["16.5.0"] } },
    WritableStream: { [READ]: { supported: ["16.5.0"] } },
    WritableStreamDefaultWriter: { [READ]: { supported: ["16.5.0"] } },
    WritableStreamDefaultController: { [READ]: { supported: ["16.5.0"] } },
    TransformStream: { [READ]: { supported: ["16.5.0"] } },
    TransformStreamDefaultController: { [READ]: { supported: ["16.5.0"] } },
    ByteLengthQueuingStrategy: { [READ]: { supported: ["16.5.0"] } },
    CountQueuingStrategy: { [READ]: { supported: ["16.5.0"] } },
    TextEncoderStream: { [READ]: { supported: ["16.6.0"] } },
    TextDecoderStream: { [READ]: { supported: ["16.6.0"] } },
    CompressionStream: { [READ]: { supported: ["17.0.0"] } },
    DecompressionStream: { [READ]: { supported: ["17.0.0"] } },
}

const StreamConsumer = {
    [READ]: { supported: ["16.7.0"] },
    arrayBuffer: { [READ]: { supported: ["16.7.0"] } },
    blob: { [READ]: { supported: ["16.7.0"] } },
    buffer: { [READ]: { supported: ["16.7.0"] } },
    json: { [READ]: { supported: ["16.7.0"] } },
    text: { [READ]: { supported: ["16.7.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    stream: {
        [READ]: { supported: ["0.9.4"] },
        ...Stream,
    },
    "node:stream": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...Stream,
    },

    "stream/promises": StreamPromise,
    "node:stream/promises": StreamPromise,

    "stream/web": {
        [READ]: { experimental: ["16.5.0"], supported: ["21.0.0"] },
        ...WebStream,
    },
    "node:stream/web": {
        [READ]: { experimental: ["16.5.0"], supported: ["21.0.0"] },
        ...WebStream,
    },

    "stream/consumers": { ...StreamConsumer },
    "node:stream/consumers": { ...StreamConsumer },
}
