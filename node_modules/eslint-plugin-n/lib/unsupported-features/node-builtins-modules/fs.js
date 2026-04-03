"use strict"

const { READ, CALL, CONSTRUCT } = require("@eslint-community/eslint-utils")

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const promises_api = {
    FileHandle: { [READ]: { supported: ["10.0.0"] } },
    access: { [READ]: { supported: ["10.0.0"] } },
    appendFile: { [READ]: { supported: ["10.0.0"] } },
    chmod: { [READ]: { supported: ["10.0.0"] } },
    chown: { [READ]: { supported: ["10.0.0"] } },
    constants: { [READ]: { supported: ["18.4.0", "16.17.0"] } },
    copyFile: { [READ]: { supported: ["10.0.0"] } },
    cp: { [READ]: { supported: ["22.3.0"], experimental: ["16.7.0"] } },
    glob: { [READ]: { experimental: ["22.0.0"], supported: ["22.17.0"] } },
    lchmod: { [READ]: { supported: ["10.0.0"], deprecated: ["10.0.0"] } },
    lchown: { [READ]: { supported: ["10.0.0"] } },
    link: { [READ]: { supported: ["10.0.0"] } },
    lstat: { [READ]: { supported: ["10.0.0"] } },
    lutimes: { [READ]: { supported: ["14.5.0", "12.19.0"] } },
    mkdir: { [READ]: { supported: ["10.0.0"] } },
    mkdtemp: { [READ]: { supported: ["10.0.0"] } },
    open: { [READ]: { supported: ["10.0.0"] } },
    opendir: { [READ]: { supported: ["12.12.0"] } },
    readFile: { [READ]: { supported: ["10.0.0"] } },
    readdir: { [READ]: { supported: ["10.0.0"] } },
    readlink: { [READ]: { supported: ["10.0.0"] } },
    realpath: { [READ]: { supported: ["10.0.0"] } },
    rename: { [READ]: { supported: ["10.0.0"] } },
    rm: { [READ]: { supported: ["14.14.0"] } },
    rmdir: { [READ]: { supported: ["10.0.0"] } },
    stat: { [READ]: { supported: ["10.0.0"] } },
    statfs: { [READ]: { supported: ["19.6.0", "18.15.0"] } },
    symlink: { [READ]: { supported: ["10.0.0"] } },
    truncate: { [READ]: { supported: ["10.0.0"] } },
    unlink: { [READ]: { supported: ["10.0.0"] } },
    utimes: { [READ]: { supported: ["10.0.0"] } },
    watch: { [READ]: { supported: ["15.9.0", "14.18.0"] } },
    writeFile: { [READ]: { supported: ["10.0.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const callback_api = {
    access: { [READ]: { supported: ["0.11.15"] } },
    appendFile: { [READ]: { supported: ["0.6.7"] } },
    chmod: { [READ]: { supported: ["0.1.30"] } },
    chown: { [READ]: { supported: ["0.1.97"] } },
    close: { [READ]: { supported: ["0.0.2"] } },
    copyFile: { [READ]: { supported: ["8.5.0"] } },
    cp: { [READ]: { supported: ["22.3.0"], experimental: ["16.7.0"] } },
    createReadStream: { [READ]: { supported: ["0.1.31"] } },
    createWriteStream: { [READ]: { supported: ["0.1.31"] } },
    exists: { [READ]: { supported: ["0.0.2"], deprecated: ["1.0.0"] } },
    fchmod: { [READ]: { supported: ["0.4.7"] } },
    fchown: { [READ]: { supported: ["0.4.7"] } },
    fdatasync: { [READ]: { supported: ["0.1.96"] } },
    fstat: { [READ]: { supported: ["0.1.95"] } },
    fsync: { [READ]: { supported: ["0.1.96"] } },
    ftruncate: { [READ]: { supported: ["0.8.6"] } },
    futimes: { [READ]: { supported: ["0.4.2"] } },
    glob: { [READ]: { experimental: ["22.0.0"], supported: ["22.17.0"] } },
    lchmod: { [READ]: { supported: ["0.1.8"], deprecated: ["0.4.7"] } },
    lchown: { [READ]: { supported: ["0.1.8"] } },
    link: { [READ]: { supported: ["0.1.31"] } },
    lstat: { [READ]: { supported: ["0.1.30"] } },
    lutimes: { [READ]: { supported: ["14.5.0", "12.19.0"] } },
    mkdir: { [READ]: { supported: ["0.1.8"] } },
    mkdtemp: { [READ]: { supported: ["5.10.0"] } },
    native: { [READ]: { supported: ["9.2.0"] } },
    open: { [READ]: { supported: ["0.0.2"] } },
    openAsBlob: {
        [READ]: { experimental: ["19.8.0"], supported: ["22.17.0"] },
    },
    opendir: { [READ]: { supported: ["12.12.0"] } },
    read: { [READ]: { supported: ["0.0.2"] } },
    readdir: { [READ]: { supported: ["0.1.8"] } },
    readFile: { [READ]: { supported: ["0.1.29"] } },
    readlink: { [READ]: { supported: ["0.1.31"] } },
    readv: { [READ]: { supported: ["13.13.0", "12.17.0"] } },
    realpath: {
        [READ]: { supported: ["0.1.31"] },
        native: { [READ]: { supported: ["9.2.0"] } },
    },
    rename: { [READ]: { supported: ["0.0.2"] } },
    rm: { [READ]: { supported: ["14.14.0"] } },
    rmdir: { [READ]: { supported: ["0.0.2"] } },
    stat: { [READ]: { supported: ["0.0.2"] } },
    statfs: { [READ]: { supported: ["19.6.0", "18.15.0"] } },
    symlink: { [READ]: { supported: ["0.1.31"] } },
    truncate: { [READ]: { supported: ["0.8.6"] } },
    unlink: { [READ]: { supported: ["0.0.2"] } },
    unwatchFile: { [READ]: { supported: ["0.1.31"] } },
    utimes: { [READ]: { supported: ["0.4.2"] } },
    watch: { [READ]: { supported: ["0.5.10"] } },
    watchFile: { [READ]: { supported: ["0.1.31"] } },
    write: { [READ]: { supported: ["0.0.2"] } },
    writeFile: { [READ]: { supported: ["0.1.29"] } },
    writev: { [READ]: { supported: ["12.9.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const synchronous_api = {
    accessSync: { [READ]: { supported: ["0.11.15"] } },
    appendFileSync: { [READ]: { supported: ["0.6.7"] } },
    chmodSync: { [READ]: { supported: ["0.6.7"] } },
    chownSync: { [READ]: { supported: ["0.1.97"] } },
    closeSync: { [READ]: { supported: ["0.1.21"] } },
    copyFileSync: { [READ]: { supported: ["8.5.0"] } },
    cpSync: { [READ]: { supported: ["22.3.0"], experimental: ["16.7.0"] } },
    existsSync: { [READ]: { supported: ["0.1.21"] } },
    fchmodSync: { [READ]: { supported: ["0.4.7"] } },
    fchownSync: { [READ]: { supported: ["0.4.7"] } },
    fdatasyncSync: { [READ]: { supported: ["0.1.96"] } },
    fstatSync: { [READ]: { supported: ["0.1.95"] } },
    fsyncSync: { [READ]: { supported: ["0.1.96"] } },
    ftruncateSync: { [READ]: { supported: ["0.8.6"] } },
    futimesSync: { [READ]: { supported: ["0.4.2"] } },
    globSync: { [READ]: { experimental: ["22.0.0"], supported: ["22.17.0"] } },
    lchmodSync: { [READ]: { supported: ["0.1.8"], deprecated: ["0.4.7"] } },
    lchownSync: { [READ]: { supported: ["0.1.8"] } },
    linkSync: { [READ]: { supported: ["0.1.31"] } },
    lstatSync: { [READ]: { supported: ["0.1.30"] } },
    lutimesSync: { [READ]: { supported: ["14.5.0", "12.19.0"] } },
    mkdirSync: { [READ]: { supported: ["0.1.21"] } },
    mkdtempSync: { [READ]: { supported: ["5.10.0"] } },
    native: { [READ]: { supported: ["9.2.0"] } },
    opendirSync: { [READ]: { supported: ["12.12.0"] } },
    openSync: { [READ]: { supported: ["0.1.21"] } },
    readdirSync: { [READ]: { supported: ["0.1.21"] } },
    readFileSync: { [READ]: { supported: ["0.1.8"] } },
    readlinkSync: { [READ]: { supported: ["0.1.31"] } },
    readSync: { [READ]: { supported: ["0.1.21"] } },
    readvSync: { [READ]: { supported: ["13.13.0", "12.17.0"] } },
    realpathSync: {
        [READ]: { supported: ["0.1.31"] },
        native: { [READ]: { supported: ["9.2.0"] } },
    },
    renameSync: { [READ]: { supported: ["0.1.21"] } },
    rmdirSync: { [READ]: { supported: ["0.1.21"] } },
    rmSync: { [READ]: { supported: ["14.14.0"] } },
    statfsSync: { [READ]: { supported: ["19.6.0", "18.15.0"] } },
    statSync: { [READ]: { supported: ["0.1.21"] } },
    symlinkSync: { [READ]: { supported: ["0.1.31"] } },
    truncateSync: { [READ]: { supported: ["0.8.6"] } },
    unlinkSync: { [READ]: { supported: ["0.1.21"] } },
    utimesSync: { [READ]: { supported: ["0.4.2"] } },
    writeFileSync: { [READ]: { supported: ["0.1.29"] } },
    writeSync: { [READ]: { supported: ["0.1.21"] } },
    writevSync: { [READ]: { supported: ["12.9.0"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
const fs = {
    promises: {
        [READ]: {
            experimental: ["10.0.0"],
            supported: ["11.14.0", "10.17.0"],
        },
        ...promises_api,
    },
    ...callback_api,
    ...synchronous_api,
    constants: { [READ]: { supported: ["0.1.8"] } },
    Dir: { [READ]: { supported: ["12.12.0"] } },
    Dirent: { [READ]: { supported: ["10.10.0"] } },
    FSWatcher: { [READ]: { supported: ["0.5.8"] } },
    StatWatcher: { [READ]: { supported: ["14.3.0", "12.20.0"] } },
    ReadStream: { [READ]: { supported: ["0.1.93"] } },
    Stats: {
        [READ]: { supported: ["0.1.21"] },
        [CALL]: { deprecated: ["22.0.0", "20.13.0"] },
        [CONSTRUCT]: { deprecated: ["22.0.0", "20.13.0"] },
    },
    StatFs: { [READ]: { supported: ["19.6.0", "18.15.0"] } },
    WriteStream: { [READ]: { supported: ["0.1.93"] } },
    common_objects: { [READ]: { supported: ["0.1.8"] } },
}

/**
 * @satisfies {import('../types.js').SupportVersionTraceMap}
 */
module.exports = {
    fs: {
        [READ]: { supported: ["0.1.8"] },
        ...fs,
    },
    "node:fs": {
        [READ]: { supported: ["14.13.1", "12.20.0"] },
        ...fs,
    },

    "fs/promises": {
        [READ]: { supported: ["14.0.0"] },
        ...promises_api,
    },
    "node:fs/promises": {
        [READ]: { supported: ["14.13.1"] },
        ...promises_api,
    },
}
