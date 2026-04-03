"use strict"

const globals = require("globals")
const { recommendeRulesConfig } = require("./_commons")

/**
 * https://eslint.org/docs/latest/use/configure/configuration-files
 * @type {import('eslint').ESLint.ConfigData}
 */
module.exports.eslintrc = {
    env: {
        node: true,
    },
    globals: {
        ...globals.es2021,
        __dirname: "off",
        __filename: "off",
        exports: "off",
        module: "off",
        require: "off",
    },
    parserOptions: {
        ecmaFeatures: { globalReturn: false },
        ecmaVersion: 2021,
        sourceType: "module",
    },
    rules: {
        ...recommendeRulesConfig,
        "n/no-unsupported-features/es-syntax": [
            "error",
            { ignores: ["modules"] },
        ],
    },
}

/**
 * https://eslint.org/docs/latest/use/configure/configuration-files-new
 * @type {import('eslint').Linter.FlatConfig}
 */
module.exports.flat = {
    name: "node/flat/recommended-module",
    languageOptions: {
        sourceType: "module",
        globals: {
            ...globals.node,
            ...module.exports.eslintrc.globals,
        },
    },
    rules:
        /** @type {import('eslint').Linter.RulesRecord} */
        (module.exports.eslintrc.rules),
}
