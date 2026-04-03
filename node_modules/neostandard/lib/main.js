'use strict'

const globals = require('globals')

const base = require('./configs/base')
const {
  modernization,
  modernizationStyles,
} = require('./configs/modernization')
const semiConfig = require('./configs/semi')

const { isNonEmpty } = require('./utils')

/**
 * @typedef NeostandardOptions
 * @property {Array<keyof import('globals')>|undefined} [env] - resolves globals for the provided environment names using the {@link https://www.npmjs.com/package/globals|globals module}
 * @property {string[]|undefined} [files] - file patterns, in minimatch syntax, the config applies to, see {@link https://eslint.org/docs/latest/use/configure/configuration-files#specifying-files-and-ignores|ESLint Docs}
 * @property {string[]|undefined} [filesTs] - additional file patterns, in minimatch syntax, that TS rules will to apply to
 * @property {import('eslint').Linter.Globals|string[]|undefined} [globals] - the base globals that should be considered available, see {@link https://eslint.org/docs/latest/use/configure/language-options#specifying-globals|ESLint Docs}
 * @property {string[]|undefined} [ignores] - patterns in minimatch syntax for files to ignore
 * @property {boolean|undefined} [noJsx] - when set, skips JSX rules
 * @property {boolean|undefined} [noStyle] - when set, skips style rules
 * @property {boolean|undefined} [semi] - when set, enforces rather than forbids semicolons
 * @property {boolean|undefined} [ts] - when set, enables TypeScript checks
 */

/**
 * @param {NeostandardOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
function neostandard (options) {
  const {
    env,
    files: rawFiles,
    filesTs,
    globals: rawGlobals,
    ignores,
    noJsx = false,
    noStyle = false,
    ts = false,
    semi = false,
  } = options || {}

  if (filesTs && !ts) {
    throw new Error('"filesTs" is only usable with the "ts" option')
  }

  /** @type {import('eslint').Linter.Globals} */
  const resolvedGlobals = Array.isArray(rawGlobals)
    ? Object.fromEntries(rawGlobals.map(global => [global, true]))
    : { ...rawGlobals }

  for (const key of env || []) {
    if (!globals[key]) {
      throw new Error(`Invalid env definition: ${env}`)
    }
    const envGlobals = globals[key]
    for (const [key, value] of Object.entries(envGlobals)) {
      resolvedGlobals[key] = resolvedGlobals[key] || value
    }
  }

  const files = [
    ...rawFiles || [],
    ...noJsx ? [] : ['**/*.jsx'],
  ]

  /** @type {import('eslint').Linter.Config[]} */
  let jsxConfigs = []

  if (!noJsx) {
    const {
      jsx,
      jsxStyles,
    } = require('./configs/jsx')

    jsxConfigs = [
      jsx,
      ...(noStyle ? [] : [jsxStyles]),
    ]
  }

  const styleConfigs = noStyle
    ? []
    : [
        require('./configs/style'),
        modernizationStyles,
        ...(semi ? [semiConfig] : []),
      ]

  const jsConfigs = [
    base,
    modernization,
    ...jsxConfigs,
    ...styleConfigs,
  ]

  return [
    // To make it a global ignore, "ignores" has to be the lone key of the config, hence no "name": https://eslint.org/docs/latest/use/configure/configuration-files#globally-ignoring-files-with-ignores
    ...ignores
      ? [{
          ignores,
        }]
      : [],

    // Config rules without any specified "files" matches all files matched by any other config (including the default rules). The sole purpose of this config is to add to the files those configs will match
    ...files.length
      ? [{
          name: 'neostandard/additional-files',
          files,
        }]
      : [],

    // Resolved globals that should exist everywhere apply everywhere
    ...isNonEmpty(resolvedGlobals)
      ? [{
          name: 'neostandard/globals',
          languageOptions: { globals: resolvedGlobals },
        }]
      : [],

    // All the main configs
    ...jsConfigs,

    // If targeting TypeScript, this will ensure those files are targeted with a TypeScript specific parser and any needed rule adaptions rules
    ...ts
      ? [require('./ts').typescriptify(jsConfigs, {
          files: [
            '**/*.ts',
            ...noJsx ? [] : ['**/*.tsx'],
            ...filesTs || [],
          ],
          ignores,
          name: 'neostandard/ts',
        })]
      : [],
  ]
}

module.exports = {
  neostandard,
}
