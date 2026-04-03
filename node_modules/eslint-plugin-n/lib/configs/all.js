/**
 * @fileoverview config for enabling all rules in the plugin.
 * @author aladdin-add<weiran.zsd@outlook.com>SS
 */
"use strict"

const { allRulesConfig } = require("./_commons")
const recommendeConfig = require("./recommended")

/**
 * https://eslint.org/docs/latest/use/configure/configuration-files-new
 * @type {import('eslint').Linter.FlatConfig}
 */
exports.flat = {
    name: "node/flat/all",
    languageOptions: recommendeConfig.flat.languageOptions ?? {},
    rules: allRulesConfig,
}
