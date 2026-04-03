"use strict"

const { READ } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const perf_hooks = {
    performance: {
        [READ]: { supported: ["8.5.0"] },
        clearMarks: { [READ]: { supported: ["8.5.0"] } },
        clearMeasures: { [READ]: { supported: ["16.7.0"] } },
        clearResourceTimings: { [READ]: { supported: ["18.2.0", "v16.17.0"] } },
        eventLoopUtilization: { [READ]: { supported: ["14.10.0", "12.19.0"] } },
        getEntries: { [READ]: { supported: ["16.7.0"] } },
        getEntriesByName: { [READ]: { supported: ["16.7.0"] } },
        getEntriesByType: { [READ]: { supported: ["16.7.0"] } },
        mark: { [READ]: { supported: ["8.5.0"] } },
        markResourceTiming: { [READ]: { supported: ["8.2.0", "16.17.0"] } },
        measure: { [READ]: { supported: ["8.5.0"] } },
        nodeTiming: {
            [READ]: { supported: ["8.5.0"] },
            bootstrapComplete: { [READ]: { supported: ["8.5.0"] } },
            environment: { [READ]: { supported: ["8.5.0"] } },
            idleTime: { [READ]: { supported: ["14.10.0", "12.19.0"] } },
            loopExit: { [READ]: { supported: ["8.5.0"] } },
            loopStart: { [READ]: { supported: ["8.5.0"] } },
            nodeStart: { [READ]: { supported: ["8.5.0"] } },
            uvMetricsInfo: { [READ]: { supported: ["22.8.0", "20.18.0"] } },
            v8Start: { [READ]: { supported: ["8.5.0"] } },
        },
        now: { [READ]: { supported: ["8.5.0"] } },
        onresourcetimingbufferfull: { [READ]: { supported: ["18.8.0"] } },
        setResourceTimingBufferSize: { [READ]: { supported: ["18.8.0"] } },
        timeOrigin: { [READ]: { supported: ["8.5.0"] } },
        timerify: { [READ]: { supported: ["8.5.0"] } },
        toJSON: { [READ]: { supported: ["16.1.0"] } },
    },
    createHistogram: { [READ]: { supported: ["15.9.0", "14.18.0"] } },
    monitorEventLoopDelay: { [READ]: { supported: ["11.10.0"] } },
    PerformanceEntry: { [READ]: { supported: ["8.5.0"] } },
    PerformanceMark: { [READ]: { supported: ["18.2.0", "16.17.0"] } },
    PerformanceMeasure: { [READ]: { supported: ["18.2.0", "16.17.0"] } },
    PerformanceNodeEntry: { [READ]: { supported: ["19.0.0"] } },
    PerformanceNodeTiming: { [READ]: { supported: ["8.5.0"] } },
    PerformanceResourceTiming: { [READ]: { supported: ["18.2.0", "16.17.0"] } },
    PerformanceObserver: { [READ]: { supported: ["8.5.0"] } },
    PerformanceObserverEntryList: { [READ]: { supported: ["8.5.0"] } },
    Histogram: { [READ]: { supported: ["11.10.0"] } },
    IntervalHistogram: { [READ]: { supported: ["11.10.0"] } },
    RecordableHistogram: { [READ]: { supported: ["15.9.0", "14.18.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    perf_hooks: {
        [READ]: { supported: ["8.5.0"] },
        ...perf_hooks,
    },
    "node:perf_hooks": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...perf_hooks,
    },
}
