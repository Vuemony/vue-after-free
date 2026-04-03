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
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        module: "readonly",
        require: "readonly",
    },
    parserOptions: {
        ecmaFeatures: { globalReturn: true },
        ecmaVersion: 2021,
        sourceType: "script",
    },
    rules: {
        ...recommendeRulesConfig,
        "n/no-unsupported-features/es-syntax": ["error", { ignores: [] }],
    },
}

/**
 * https://eslint.org/docs/latest/use/configure/configuration-files-new
 * @type {import('eslint').Linter.FlatConfig}
 */
module.exports.flat = {
    name: "node/flat/recommended-script",
    languageOptions: {
        sourceType: "commonjs",
        globals: {
            ...globals.node,
            ...module.exports.eslintrc.globals,
        },
    },
    rules:
        /** @type {import('eslint').Linter.RulesRecord} */
        (module.exports.eslintrc.rules),
}
