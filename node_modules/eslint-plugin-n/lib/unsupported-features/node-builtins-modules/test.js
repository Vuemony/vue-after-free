"use strict"

const { READ } = require("@eslint-community/eslint-utils")

// /**
//  * @satisfies {import('../types.js').SupportVersionTraceMap}
//  */
// const MockFunctionContext = {
//     [CONSTRUCT]: { supported: ["19.1.0", "18.13.0"] },
//     calls: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
//     callCount: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
//     mockImplementation: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
//     mockImplementationOnce: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
//     resetCalls: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
//     restore: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
// }

// /**
//  * @satisfies {import('../types.js').SupportVersionTraceMap}
//  */
// const MockTimers = {
//     [CONSTRUCT]: {
//         experimental: ["20.4.0", "18.19.0"],
//         supported: ["23.1.0"],
//     },
//     ...MockTimers_common,
// }

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const MockTimers_common = {
    enable: {
        [READ]: { experimental: ["20.4.0", "18.19.0"], supported: ["23.1.0"] },
    },
    reset: {
        [READ]: { experimental: ["20.4.0", "18.19.0"], supported: ["23.1.0"] },
    },
    [Symbol.dispose]: {
        [READ]: { experimental: ["20.4.0", "18.19.0"], supported: ["23.1.0"] },
    },
    tick: {
        [READ]: { experimental: ["20.4.0", "18.19.0"], supported: ["23.1.0"] },
    },
}

// /**
//  * @satisfies {import('../types.js').SupportVersionTraceMap}
//  */
// const MockModuleContext = {
//     [CONSTRUCT]: { experimental: ["22.3.0", "20.18.0"] },
//     restore: { [READ]: { experimental: ["22.3.0", "20.18.0"] } },
// }

// /**
//  * @satisfies {import('../types.js').SupportVersionTraceMap}
//  */
// const MockTracker = {
//     [CONSTRUCT]: { supported: ["19.1.0", "18.13.0"] },
//     ...MockTracker_common,
// }

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const MockTracker_common = {
    fn: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
    getter: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
    method: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
    module: { [READ]: { experimental: ["22.3.0", "20.18.0"] } },
    reset: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
    restoreAll: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
    setter: { [READ]: { supported: ["19.1.0", "18.13.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const test_common = {
    only: { [READ]: { supported: ["20.2.0", "18.17.0"] } },
    skip: { [READ]: { supported: ["20.2.0", "18.17.0"] } },
    todo: { [READ]: { supported: ["20.2.0", "18.17.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const suite = {
    [READ]: { supported: ["22.0.0", "20.13.0"] },
    only: { [READ]: { supported: ["22.0.0", "20.13.0"] } },
    skip: { [READ]: { supported: ["22.0.0", "20.13.0"] } },
    todo: { [READ]: { supported: ["22.0.0", "20.13.0"] } },
}

// /**
//  * @satisfies {import('../types.js').SupportVersionTraceMap}
//  */
// const SuiteContext = {
//     [CONSTRUCT]: { supported: ["18.7.0", "16.17.0"] },
//     filePath: { [READ]: { supported: ["22.6.0"] } },
//     name: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
//     signal: { [READ]: { supported: ["18.7.0", "16.17.0"] } },
// }

// /**
//  * @satisfies {import('../types.js').SupportVersionTraceMap}
//  */
// const TestContext = {
//     [CONSTRUCT]: { supported: ["18.0.0", "16.17.0"] },
//     after: { [READ]: { supported: ["19.3.0", "18.13.0"] } },
//     afterEach: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
//     assert: {
//         [READ]: { supported: ["22.2.0", "20.15.0"] },
//         snapshot: { [READ]: { experimental: ["22.3.0"] } },
//
//         // extends all top-level functions from `node:assert`
//         assert: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.5.9"] }
//         deepEqual: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         deepStrictEqual: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["1.2.0"] }
//         doesNotMatch: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: {supported: ["16.0.0"], },
//         doesNotReject: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["10.0.0"] }
//         doesNotThrow: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         equal: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         fail: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         ifError: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.97"] }
//         match: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["16.0.0"], },
//         notDeepEqual: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         notDeepStrictEqual: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["1.2.0"] }
//         notEqual: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         notStrictEqual: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         ok: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         rejects: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["10.0.0"] }
//         strictEqual: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//         throws: { [READ]: { supported: ["22.2.0", "20.15.0"] } }, // original: { supported: ["0.1.21"] }
//     },
//     before: { [READ]: { supported: ["20.1.0", "18.17.0"] } },
//     beforeEach: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
//     diagnostic: { [READ]: { supported: ["18.0.0", "16.17.0"] } },
//     filePath: { [READ]: { supported: ["22.6.0", "20.16.0"] } },
//     fullName: { [READ]: { supported: ["22.3.0"] } },
//     name: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
//     plan: { [READ]: { experimental: ["22.2.0", "20.15.0"] } },
//     runOnly: { [READ]: { supported: ["18.0.0", "16.17.0"] } },
//     signal: { [READ]: { supported: ["18.7.0", "16.17.0"] } },
//     skip: { [READ]: { supported: ["18.0.0", "16.17.0"] } },
//     todo: { [READ]: { supported: ["18.0.0", "16.17.0"] } },
//     test: { [READ]: { supported: ["18.0.0", "16.17.0"] } },
// }

// /**
//  * @satisfies {import('../types.js').SupportVersionTraceMap}
//  */
// const TestsStream = {
//     [READ]: { supported: ["18.9.0", "16.19.0"] },
//
//     // // extends `node:stream`'s `Readable` class
//     // compose: {
//     //     [READ]: {
//     //         experimental: ["19.1.0", "18.13.0" /* , "18.9.0", "16.19.0"*/],
//     //     },
//     // }, // original: { experimental: ["19.1.0", "18.13.0"] }
//     // closed: { [READ]: { supported: ["18.9.0" /* , "16.19.0"*/] } }, // original: { supported: ["18.0.0"] }
//     // destroy: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["8.0.0"] }
//     // destroyed: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["8.0.0"] }
//     // errored: { [READ]: { supported: ["18.9.0" /*, "16.19.0"*/] } }, // original: { supported: ["18.0.0"] }
//     // isPaused: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.11.14"] }
//     // pause: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // pipe: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // read: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // readable: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["11.4.0"] }
//     // readableAborted: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["16.8.0"] }
//     // readableDidRead: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["16.7.0", "14.18.0"] }
//     // readableEncoding: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["12.7.0"] }
//     // readableEnded: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["12.9.0"] }
//     // readableFlowing: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["9.4.0"] }
//     // readableHighWaterMark: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["9.3.0"] }
//     // readableLength: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["9.4.0"] }
//     // readableObjectMode: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["12.3.0"] }
//     // resume: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // setEncoding: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // unpipe: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // unshift: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.11"] }
//     // wrap: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // [Symbol.asyncIterator]: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["10.0.0"], supported: ["11.14.0"] }
//     // [Symbol.asyncDispose]: {
//     //     [READ]: {
//     //         experimental: ["20.4.0", "18.18.0" /*, "18.9.0", "16.19.0"*/],
//     //     },
//     // }, // original: { experimental: ["20.4.0", "18.18.0"] }
//     // asIndexedPairs: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // drop: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // every: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // filter: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.4.0", "16.14.0"] }
//     // find: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // flatMap: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // forEach: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // iterator: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["16.3.0"] }
//     // map: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.4.0", "16.14.0"] }
//     // reduce: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // some: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // toArray: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     // take: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["17.5.0", "16.15.0"] }
//     //
//     // from: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["12.3.0", "10.17.0"] }
//     // fromWeb: { [READ]: { experimental: ["18.9.0" /*, "16.19.0"*/] } }, // original: { experimental: ["17.0.0"] }
//     // isDistributed: { [READ]: { experimental: ["18.9.0", "16.19.0"] } }, // original: { experimental: ["16.8.0"] }
//     // toWeb: { [READ]: { experimental: ["18.9.0" /*, "16.19.0"*/] } }, // original: { experimental: ["17.0.0"] }
//     //
//     // [CONSTRUCT]: { supported: ["18.9.0", "16.19.0"] }, // original: { supported: ["11.2.0", "10.16.0"] }
//     // _construct: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["15.0.0"] }
//     // _destroy: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["8.0.0"] }
//     // _read: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["0.9.4"] }
//     // push: { [READ]: { supported: ["18.9.0", "16.19.0"] } }, // original: { supported: ["8.0.0"] }
// }

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const test = {
    after: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
    afterEach: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
    assert: {
        [READ]: { supported: ["22.14.0", "23.7.0"] },
        register: { [READ]: { supported: ["22.14.0", "23.7.0"] } },
    },
    before: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
    beforeEach: { [READ]: { supported: ["18.8.0", "16.18.0"] } },
    describe: suite,
    it: {
        [READ]: { supported: ["18.6.0", "16.17.0"] },
        ...test_common,
    },
    mock: {
        [READ]: { supported: ["19.1.0", "18.13.0"] },
        ...MockTracker_common,
        timers: {
            [READ]: {
                experimental: ["20.4.0", "18.19.0"],
                supported: ["23.1.0"],
            },
            ...MockTimers_common,
        },
    },
    only: { [READ]: { supported: ["20.2.0", "18.17.0"] } },
    run: { [READ]: { supported: ["18.9.0", "16.19.0"] } },
    snapshot: {
        [READ]: { experimental: ["22.3.0"] },
        setDefaultSnapshotSerializers: { [READ]: { experimental: ["22.3.0"] } },
        setResolveSnapshotPath: { [READ]: { experimental: ["22.3.0"] } },
    },
    skip: { [READ]: { supported: ["20.2.0", "18.17.0"] } },
    suite,
    test: {
        [READ]: { supported: ["18.0.0", "16.17.0"] },
        ...test_common,
    },
    todo: { [READ]: { supported: ["20.2.0", "18.17.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    "node:test": {
        [READ]: {
            experimental: ["18.7.0", "16.17.0"],
            supported: ["20.0.0"],
        },
        ...test,
    },
}
