"use strict"

const bufferModule = require("./node-builtins-modules/buffer.js")
const consoleModule = require("./node-builtins-modules/console.js")
const cryptoModule = require("./node-builtins-modules/crypto.js")
const eventsModule = require("./node-builtins-modules/events.js")
const processModule = require("./node-builtins-modules/process.js")
const perfModule = require("./node-builtins-modules/perf_hooks.js")
const streamModule = require("./node-builtins-modules/stream.js")
const timersModule = require("./node-builtins-modules/timers.js")
const urlModule = require("./node-builtins-modules/url.js")
const utilModule = require("./node-builtins-modules/util.js")
const workerThreadsModule = require("./node-builtins-modules/worker_threads.js")

const { buffer } = bufferModule
const { console } = consoleModule
const { crypto } = cryptoModule
const { events } = eventsModule
const { process } = processModule
const { perf_hooks } = perfModule
const { ["stream/web"]: WebStream } = streamModule
const { timers } = timersModule
const { url } = urlModule
const { util } = utilModule
const { worker_threads } = workerThreadsModule

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @type {import('./types.js').SupportVersionTraceMap}
 */
const nodeGlobals = {
    __filename: { [READ]: { supported: ["0.0.1"] } },
    __dirname: { [READ]: { supported: ["0.1.27"] } },
    require: {
        [READ]: { supported: ["0.1.13"] },
        cache: { [READ]: { supported: ["0.3.0"] } },
        extensions: {
            [READ]: {
                supported: ["0.3.0"],
                deprecated: ["0.10.6"],
            },
        },
        main: { [READ]: { supported: ["0.1.17"] } },
        resolve: {
            [READ]: { supported: ["0.3.0"] },
            paths: { [READ]: { supported: ["8.9.0"] } },
        },
    },
    module: {
        [READ]: { supported: ["0.1.16"] },
        children: { [READ]: { supported: ["0.1.16"] } },
        exports: { [READ]: { supported: ["0.1.16"] } },
        filename: { [READ]: { supported: ["0.1.16"] } },
        id: { [READ]: { supported: ["0.1.16"] } },
        isPreloading: { [READ]: { supported: ["15.4.0", "14.17.0"] } },
        loaded: { [READ]: { supported: ["0.1.16"] } },
        parent: {
            [READ]: {
                supported: ["0.1.16"],
                deprecated: ["14.6.0", "12.19.0"],
            },
        },
        path: { [READ]: { supported: ["11.14.0"] } },
        paths: { [READ]: { supported: ["0.4.0"] } },
        require: { [READ]: { supported: ["0.5.1"] } },
    },
    exports: { [READ]: { supported: ["0.1.12"] } },

    AbortController: {
        [READ]: { experimental: ["15.0.0", "14.17.0"], supported: ["15.4.0"] },
    },
    AbortSignal: {
        [READ]: { supported: ["15.0.0", "14.17.0"] },
        abort: { [READ]: { supported: ["15.12.0", "14.17.0"] } },
        timeout: { [READ]: { supported: ["17.3.0", "16.14.0"] } },
        any: { [READ]: { supported: ["20.3.0", "18.17.0"] } },
    },
    DOMException: { [READ]: { supported: ["17.0.0"] } },
    FormData: {
        [READ]: { experimental: ["17.5.0", "16.15.0"], supported: ["21.0.0"] },
    },
    Headers: {
        [READ]: { experimental: ["17.5.0", "16.15.0"], supported: ["21.0.0"] },
    },
    MessageEvent: { [READ]: { supported: ["15.0.0"] } },
    Navigator: { [READ]: { experimental: ["21.0.0"] } },
    Request: {
        [READ]: { experimental: ["17.5.0", "16.15.0"], supported: ["21.0.0"] },
    },
    Response: {
        [READ]: { experimental: ["17.5.0", "16.15.0"], supported: ["21.0.0"] },
    },
    WebAssembly: { [READ]: { supported: ["8.0.0"] } },
    WebSocket: {
        [READ]: {
            experimental: ["21.0.0", "20.10.0"],
            supported: ["22.4.0"],
        },
    },

    fetch: {
        [READ]: { experimental: ["17.5.0", "16.15.0"], supported: ["21.0.0"] },
    },
    global: { [READ]: { supported: ["0.1.27"], deprecated: ["12.0.0"] } },
    queueMicrotask: {
        [READ]: { supported: ["12.0.0"], experimental: ["11.0.0"] },
    },
    navigator: {
        [READ]: { experimental: ["21.0.0"] },
        hardwareConcurrency: { [READ]: { supported: ["21.0.0"] } },
        language: { [READ]: { supported: ["21.2.0"] } },
        languages: { [READ]: { supported: ["21.2.0"] } },
        platform: { [READ]: { supported: ["21.2.0"] } },
        userAgent: { [READ]: { supported: ["21.1.0"] } },
    },
    structuredClone: { [READ]: { supported: ["17.0.0"] } },

    // --experimental-webstorage
    localStorage: { [READ]: { experimental: ["22.4.0"] } },
    sessionStorage: { [READ]: { experimental: ["22.4.0"] } },
    Storage: { [READ]: { experimental: ["22.4.0"] } },

    // module.buffer
    Blob: buffer.Blob,
    Buffer: {
        ...buffer.Buffer,
        [READ]: { supported: ["0.1.103"] },
    },
    File: buffer.File,
    atob: { [READ]: { supported: ["16.0.0"] } },
    btoa: { [READ]: { supported: ["16.0.0"] } },

    // module.console
    console: console,

    // module.crypto
    crypto: {
        ...crypto.webcrypto,
        [READ]: { experimental: ["17.6.0", "16.15.0"], supported: ["23.0.0"] },
    },
    Crypto: {
        [READ]: { experimental: ["17.6.0", "16.15.0"], supported: ["23.0.0"] },
    },
    CryptoKey: {
        [READ]: { experimental: ["17.6.0", "16.15.0"], supported: ["23.0.0"] },
    },
    SubtleCrypto: { [READ]: { experimental: ["17.6.0", "16.15.0"] } },

    // module.events
    CloseEvent: { [READ]: { supported: ["23.0.0"] } },
    CustomEvent: {
        [READ]: { experimental: ["18.7.0", "16.17.0"], supported: ["23.0.0"] },
    },
    Event: events.Event,
    EventSource: { [READ]: { experimental: ["10.18.0"] } },
    EventTarget: events.EventTarget,

    // module.perf_hooks
    PerformanceEntry: {
        ...perf_hooks.PerformanceEntry,
        [READ]: { supported: ["19.0.0"] },
    },
    PerformanceMark: {
        ...perf_hooks.PerformanceMark,
        [READ]: { supported: ["19.0.0"] },
    },
    PerformanceMeasure: {
        ...perf_hooks.PerformanceMeasure,
        [READ]: { supported: ["19.0.0"] },
    },
    PerformanceObserver: {
        ...perf_hooks.PerformanceObserver,
        [READ]: { supported: ["19.0.0"] },
    },
    PerformanceObserverEntryList: {
        ...perf_hooks.PerformanceObserverEntryList,
        [READ]: { supported: ["19.0.0"] },
    },
    PerformanceResourceTiming: {
        ...perf_hooks.PerformanceResourceTiming,
        [READ]: { supported: ["19.0.0"] },
    },
    performance: {
        ...perf_hooks.performance,
        [READ]: { supported: ["16.0.0"] },
    },

    // module.process
    process: process,

    // module.stream
    ReadableStream: {
        ...WebStream.ReadableStream,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    ReadableStreamDefaultReader: {
        ...WebStream.ReadableStreamDefaultReader,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    ReadableStreamBYOBReader: {
        ...WebStream.ReadableStreamBYOBReader,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    ReadableStreamDefaultController: {
        ...WebStream.ReadableStreamDefaultController,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    ReadableByteStreamController: {
        ...WebStream.ReadableByteStreamController,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    ReadableStreamBYOBRequest: {
        ...WebStream.ReadableStreamBYOBRequest,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    WritableStream: {
        ...WebStream.WritableStream,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    WritableStreamDefaultWriter: {
        ...WebStream.WritableStreamDefaultWriter,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    WritableStreamDefaultController: {
        ...WebStream.WritableStreamDefaultController,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    TransformStream: {
        ...WebStream.TransformStream,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    TransformStreamDefaultController: {
        ...WebStream.TransformStreamDefaultController,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    ByteLengthQueuingStrategy: {
        ...WebStream.ByteLengthQueuingStrategy,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    CountQueuingStrategy: {
        ...WebStream.CountQueuingStrategy,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    TextEncoderStream: {
        ...WebStream.TextEncoderStream,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    TextDecoderStream: {
        ...WebStream.TextDecoderStream,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    CompressionStream: {
        ...WebStream.CompressionStream,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },
    DecompressionStream: {
        ...WebStream.DecompressionStream,
        [READ]: { experimental: ["18.0.0"], supported: ["22.15.0", "23.11.0"] },
    },

    // module.timers
    setInterval: timers.setInterval,
    clearInterval: timers.clearInterval,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    setImmediate: timers.setImmediate,
    clearImmediate: timers.clearImmediate,

    // module.url
    URL: {
        ...url.URL,
        [READ]: { supported: ["10.0.0"] },
    },
    URLSearchParams: {
        ...url.URLSearchParams,
        [READ]: { supported: ["10.0.0"] },
    },

    // module.util
    TextDecoder: {
        ...util.TextDecoder,
        [READ]: { supported: ["11.0.0"] },
    },
    TextEncoder: {
        ...util.TextEncoder,
        [READ]: { supported: ["11.0.0"] },
    },

    // module.worker_threads
    BroadcastChannel: {
        ...worker_threads.BroadcastChannel,
        [READ]: { supported: ["18.0.0"] },
    },
    MessageChannel: {
        ...worker_threads.MessageChannel,
        [READ]: { supported: ["15.0.0"] },
    },
    MessagePort: {
        ...worker_threads.MessagePort,
        [READ]: { supported: ["15.0.0"] },
    },
}

module.exports = nodeGlobals
