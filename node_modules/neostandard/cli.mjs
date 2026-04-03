#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { gitignoreToMinimatch } from '@humanwhocodes/gitignore-to-minimatch'
import { peowly } from 'peowly'

import { isStringArray } from './lib/utils.js'

const packagePath = new URL('./package.json', import.meta.url)
const pkg = JSON.parse(await readFile(packagePath, { encoding: 'utf8' }))

let {
  flags: {
    esm,
    migrate,
    ...flags
  },
} = peowly({
  options: {
    env: {
      listGroup: 'Config options',
      description: 'Legacy environment definition, eg. "mocha". --global is preferred',
      type: 'string',
      multiple: true,
    },
    esm: {
      listGroup: 'Output options',
      description: 'Outputs as ESM instead of CJS',
      type: 'boolean',
    },
    global: {
      listGroup: 'Config options',
      description: 'Adds the provided string as a global',
      type: 'string',
      multiple: true,
      short: 'g',
    },
    ignore: {
      listGroup: 'Config options',
      description: 'Ignores the provided pattern when linting files',
      type: 'string',
      multiple: true,
      short: 'i',
    },
    'no-jsx': {
      listGroup: 'Config options',
      description: 'Deactivates all jsx support',
      type: 'boolean',
    },
    'no-style': {
      listGroup: 'Config options',
      description: 'Deactivates all style linting',
      type: 'boolean',
    },
    ts: {
      listGroup: 'Config options',
      description: 'Activates all TypeScript based linting',
      type: 'boolean',
    },
    migrate: {
      listGroup: 'Input options',
      description: 'Migrates the standardjs config in the package.json in the current directory',
      type: 'boolean',
    },
    semi: {
      listGroup: 'Config options',
      description: 'Enforces rather than bans semi-colons',
      type: 'boolean',
    },
  },
  description: 'Generate a neostandard config for eslint',
  examples: [
    '--semi --no-style > eslint.config.js',
  ],
  name: 'neostandard',
  pkg,
})

const flagMapping = /** @satisfies {Record<keyof typeof flags, keyof import('./index.js').NeostandardOptions>} */ ({
  env: 'env',
  global: 'globals',
  ignore: 'ignores',
  'no-jsx': 'noJsx',
  'no-style': 'noStyle',
  semi: 'semi',
  ts: 'ts',
})

const flagKeys = /** @type {Array<keyof typeof flagMapping>} */ (Object.keys(flagMapping))

/** @type {Partial<typeof flags> & { env?: string[] }} */
const flagsFromMigration = {}

/**
 * @template {string} T
 * @template {T extends `${infer U}s` ? U : T} R
 * @param {T} value
 * @returns {R}
 */
function ensureSingular (value) {
  return /** @type {R} */ (value.endsWith('s') ? value.slice(0, -1) : value)
}

if (migrate) {
  /** @type {unknown} */
  let sourcePkg

  try {
    sourcePkg = JSON.parse(await readFile(join(process.cwd(), 'package.json'), 'utf8'))
  } catch (cause) {
    console.error('Failed to read package.json:', cause)
    process.exit(1)
  }

  if (sourcePkg && typeof sourcePkg === 'object') {
    esm = esm || ('type' in sourcePkg && sourcePkg.type === 'module')
    const sourceConfig = ('standard' in sourcePkg && sourcePkg.standard) ||
      ('semistandard' in sourcePkg && sourcePkg.semistandard) ||
      ('ts-standard' in sourcePkg && sourcePkg['ts-standard'])

    for (const [rawKey, value] of Object.entries((typeof sourceConfig === 'object' && sourceConfig) || {})) {
      const key = ensureSingular(rawKey)

      if (key === 'global' || key === 'ignore' || key === 'env') {
        if (typeof value === 'string') {
          flagsFromMigration[key] = [value]
        } else if (Array.isArray(value) && isStringArray(value)) {
          flagsFromMigration[key] = value
        } else {
          console.error(`Invalid migration value for "standard.${key}". Expected an array of strings, got:`, value)
          process.exit(1)
        }

        if (key === 'ignore') {
          flagsFromMigration[key] = flagsFromMigration[key]?.map(item => gitignoreToMinimatch(item))
        }
      } else {
        console.warn(`Migration for "standard.${key}" is not yet supported. Open an issue at https://github.com/neostandard/neostandard`)
      }
    }
  }
}

/** @type {string[]} */
const config = []

for (const flag of flagKeys) {
  const newValue = flags[flag]
  const migratedValue = flagsFromMigration[flag]

  const value = Array.isArray(newValue) && Array.isArray(migratedValue)
    ? [...newValue, ...migratedValue]
    : (newValue || migratedValue)

  if (value) {
    const formattedValue = JSON.stringify(value)
      .replaceAll('"', '\'')
      .replaceAll('\',\'', '\', \'')

    config.push(`${flagMapping[flag]}: ${formattedValue}`)
  }
}

const formattedConfig = config.length > 1
  ? `{\n  ${config.join(',\n  ')},\n}`
  : (
      config.length
        ? `{ ${config.join(', ')} }`
        : '{}'
    )
const semiEnding = flags.semi ? ';' : ''

console.log(
  esm
    ? `import neostandard from 'neostandard'${semiEnding}

export default neostandard(${formattedConfig})${semiEnding}`
    : `'use strict'${semiEnding}

module.exports = require('neostandard')(${formattedConfig})${semiEnding}`)
