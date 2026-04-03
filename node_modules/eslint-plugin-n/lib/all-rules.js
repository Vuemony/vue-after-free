/**
 * @fileoverview All rules in the plugin.
 * @author aladdin-add<weiran.zsd@outlook.com>
 * TODO: maybe auto-generated in the future?
 */
"use strict"

/** @import { Rule } from 'eslint' */

/** @type {Record<string, Rule.RuleModule> } */
module.exports = {
    "callback-return": require("./rules/callback-return"),
    "exports-style": require("./rules/exports-style"),
    "file-extension-in-import": require("./rules/file-extension-in-import"),
    "global-require": require("./rules/global-require"),
    "handle-callback-err": require("./rules/handle-callback-err"),
    "no-callback-literal": require("./rules/no-callback-literal"),
    "no-deprecated-api": require("./rules/no-deprecated-api"),
    "no-exports-assign": require("./rules/no-exports-assign"),
    "no-extraneous-import": require("./rules/no-extraneous-import"),
    "no-extraneous-require": require("./rules/no-extraneous-require"),
    "no-missing-import": require("./rules/no-missing-import"),
    "no-missing-require": require("./rules/no-missing-require"),
    "no-mixed-requires": require("./rules/no-mixed-requires"),
    "no-new-require": require("./rules/no-new-require"),
    "no-path-concat": require("./rules/no-path-concat"),
    "no-process-env": require("./rules/no-process-env"),
    "no-process-exit": require("./rules/no-process-exit"),
    "no-restricted-import": require("./rules/no-restricted-import"),
    "no-restricted-require": require("./rules/no-restricted-require"),
    "no-sync": require("./rules/no-sync"),
    "no-top-level-await": require("./rules/no-top-level-await"),
    "no-unpublished-bin": require("./rules/no-unpublished-bin"),
    "no-unpublished-import": require("./rules/no-unpublished-import"),
    "no-unpublished-require": require("./rules/no-unpublished-require"),
    "no-unsupported-features/es-builtins": require("./rules/no-unsupported-features/es-builtins"),
    "no-unsupported-features/es-syntax": require("./rules/no-unsupported-features/es-syntax"),
    "no-unsupported-features/node-builtins": require("./rules/no-unsupported-features/node-builtins"),
    "prefer-global/buffer": require("./rules/prefer-global/buffer"),
    "prefer-global/console": require("./rules/prefer-global/console"),
    "prefer-global/crypto": require("./rules/prefer-global/crypto"),
    "prefer-global/process": require("./rules/prefer-global/process"),
    "prefer-global/text-decoder": require("./rules/prefer-global/text-decoder"),
    "prefer-global/text-encoder": require("./rules/prefer-global/text-encoder"),
    "prefer-global/url-search-params": require("./rules/prefer-global/url-search-params"),
    "prefer-global/url": require("./rules/prefer-global/url"),
    "prefer-global/timers": require("./rules/prefer-global/timers"),
    "prefer-node-protocol": require("./rules/prefer-node-protocol"),
    "prefer-promises/dns": require("./rules/prefer-promises/dns"),
    "prefer-promises/fs": require("./rules/prefer-promises/fs"),
    "process-exit-as-throw": require("./rules/process-exit-as-throw"),
    hashbang: require("./rules/hashbang"),

    // Deprecated rules.
    "no-hide-core-modules": require("./rules/no-hide-core-modules"),
    shebang: require("./rules/shebang"),
}
