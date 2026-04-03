"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const v8 = {
    serialize: { [READ]: { supported: ["8.0.0"] } },
    deserialize: { [READ]: { supported: ["8.0.0"] } },
    Serializer: { [READ]: { supported: ["8.0.0"] } },
    Deserializer: { [READ]: { supported: ["8.0.0"] } },
    DefaultSerializer: { [READ]: { supported: ["8.0.0"] } },
    DefaultDeserializer: { [READ]: { supported: ["8.0.0"] } },
    promiseHooks: {
        [READ]: { supported: ["17.1.0", "16.14.0"] },
        onInit: { [READ]: { supported: ["17.1.0", "16.14.0"] } },
        onSettled: { [READ]: { supported: ["17.1.0", "16.14.0"] } },
        onBefore: { [READ]: { supported: ["17.1.0", "16.14.0"] } },
        onAfter: { [READ]: { supported: ["17.1.0", "16.14.0"] } },
        createHook: { [READ]: { supported: ["17.1.0", "16.14.0"] } },
    },
    startupSnapshot: {
        [READ]: { experimental: ["18.6.0", "16.17.0"] },
        addSerializeCallback: { [READ]: { supported: ["18.6.0", "16.17.0"] } },
        addDeserializeCallback: {
            [READ]: { supported: ["18.6.0", "16.17.0"] },
        },
        setDeserializeMainFunction: {
            [READ]: { supported: ["18.6.0", "16.17.0"] },
        },
        isBuildingSnapshot: { [READ]: { supported: ["18.6.0", "16.17.0"] } },
    },
    cachedDataVersionTag: { [READ]: { supported: ["8.0.0"] } },
    getHeapCodeStatistics: { [READ]: { supported: ["12.8.0"] } },
    getHeapSnapshot: { [READ]: { supported: ["11.13.0"] } },
    getHeapSpaceStatistics: { [READ]: { supported: ["6.0.0"] } },
    getHeapStatistics: { [READ]: { supported: ["1.0.0"] } },
    isStringOneByteRepresentation: {
        [READ]: { supported: ["22.15.0", "23.10.0"] },
    },
    queryObjects: { [READ]: { experimental: ["22.0.0", "20.13.0"] } },
    setFlagsFromString: { [READ]: { supported: ["1.0.0"] } },
    stopCoverage: { [READ]: { supported: ["15.1.0", "14.18.0", "12.22.0"] } },
    takeCoverage: { [READ]: { supported: ["15.1.0", "14.18.0", "12.22.0"] } },
    writeHeapSnapshot: { [READ]: { supported: ["11.13.0"] } },
    setHeapSnapshotNearHeapLimit: {
        [READ]: {
            experimental: ["18.10.0", "16.18.0"],
            supported: ["22.17.0"],
        },
    },
    GCProfiler: { [READ]: { supported: ["19.6.0", "18.15.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    v8: { ...v8, [READ]: { supported: ["1.0.0"] } },
    "node:v8": { ...v8, [READ]: { supported: ["14.13.1", "12.20.0"] } },
}
