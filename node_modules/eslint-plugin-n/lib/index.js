"use strict"

const pkg = require("../package.json")
const esmConfig = require("./configs/recommended-module")
const cjsConfig = require("./configs/recommended-script")
const recommendedConfig = require("./configs/recommended")
const allRulesConfig = require("./configs/all")
const allRules = require("./all-rules")

/** @import { ESLint, Linter } from 'eslint' */

/** @type {ESLint.Plugin} */
const base = {
    meta: {
        name: pkg.name,
        version: pkg.version,
    },
    rules: allRules,
}
/**
 * @typedef {{
 *     'recommended-module': ESLint.ConfigData;
 *     'recommended-script': ESLint.ConfigData;
 *     'recommended': ESLint.ConfigData;
 *     'flat/recommended-module': Linter.Config;
 *     'flat/recommended-script': Linter.Config;
 *     'flat/recommended': Linter.Config;
 *     'flat/mixed-esm-and-cjs': Linter.Config[];
 *     'flat/all': Linter.Config;
 * }} Configs
 */

/** @type {Configs} */
const configs = {
    "recommended-module": { plugins: ["n"], ...esmConfig.eslintrc },
    "recommended-script": { plugins: ["n"], ...cjsConfig.eslintrc },
    recommended: { plugins: ["n"], ...recommendedConfig.eslintrc },
    "flat/recommended-module": { plugins: { n: base }, ...esmConfig.flat },
    "flat/recommended-script": { plugins: { n: base }, ...cjsConfig.flat },
    "flat/recommended": { plugins: { n: base }, ...recommendedConfig.flat },
    "flat/mixed-esm-and-cjs": [
        { files: ["**/*.js"], plugins: { n: base }, ...recommendedConfig.flat },
        { files: ["**/*.mjs"], plugins: { n: base }, ...esmConfig.flat },
        { files: ["**/*.cjs"], plugins: { n: base }, ...cjsConfig.flat },
    ],
    "flat/all": { plugins: { n: base }, ...allRulesConfig.flat },
}

/** @type {ESLint.Plugin & { configs: Configs }} */
module.exports = Object.assign(base, { configs })
