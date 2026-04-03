"use strict"

const NodeBuiltinGlobals = require("./node-globals.js")
const NodeBuiltinImportMeta = require("./node-import-meta.js")

/**
 * @type {import('./types.js').SupportVersionTraceMap}
 */
const NodeBuiltinModules = {
    ...require("./node-builtins-modules/assert.js"),
    ...require("./node-builtins-modules/async_hooks.js"),
    ...require("./node-builtins-modules/buffer.js"),
    ...require("./node-builtins-modules/child_process.js"),
    ...require("./node-builtins-modules/cluster.js"),
    ...require("./node-builtins-modules/console.js"),
    ...require("./node-builtins-modules/crypto.js"),
    ...require("./node-builtins-modules/dgram.js"),
    ...require("./node-builtins-modules/diagnostics_channel.js"),
    ...require("./node-builtins-modules/dns.js"),
    ...require("./node-builtins-modules/domain.js"),
    ...require("./node-builtins-modules/events.js"),
    ...require("./node-builtins-modules/fs.js"),
    ...require("./node-builtins-modules/http2.js"),
    ...require("./node-builtins-modules/http.js"),
    ...require("./node-builtins-modules/https.js"),
    ...require("./node-builtins-modules/inspector.js"),
    ...require("./node-builtins-modules/module.js"),
    ...require("./node-builtins-modules/net.js"),
    ...require("./node-builtins-modules/os.js"),
    ...require("./node-builtins-modules/path.js"),
    ...require("./node-builtins-modules/perf_hooks.js"),
    ...require("./node-builtins-modules/process.js"),
    ...require("./node-builtins-modules/punycode.js"),
    ...require("./node-builtins-modules/querystring.js"),
    ...require("./node-builtins-modules/readline.js"),
    ...require("./node-builtins-modules/repl.js"),
    ...require("./node-builtins-modules/sea.js"),
    ...require("./node-builtins-modules/stream.js"),
    ...require("./node-builtins-modules/string_decoder.js"),
    ...require("./node-builtins-modules/sqlite.js"),
    ...require("./node-builtins-modules/test.js"),
    ...require("./node-builtins-modules/timers.js"),
    ...require("./node-builtins-modules/tls.js"),
    ...require("./node-builtins-modules/trace_events.js"),
    ...require("./node-builtins-modules/tty.js"),
    ...require("./node-builtins-modules/url.js"),
    ...require("./node-builtins-modules/util.js"),
    ...require("./node-builtins-modules/v8.js"),
    ...require("./node-builtins-modules/vm.js"),
    ...require("./node-builtins-modules/wasi.js"),
    ...require("./node-builtins-modules/worker_threads.js"),
    ...require("./node-builtins-modules/zlib.js"),
}

module.exports = {
    NodeBuiltinGlobals,
    NodeBuiltinModules,
    NodeBuiltinImportMeta,
}
