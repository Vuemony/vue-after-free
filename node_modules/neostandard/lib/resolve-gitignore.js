'use strict'

const { readFileSync } = require('node:fs')
const path = require('node:path')

// @ts-ignore - There's no types for the cjs file of this package
const { gitignoreToMinimatch } = require('@humanwhocodes/gitignore-to-minimatch')
const findUp = require('find-up')

const FLAT_CONFIG_FILENAMES = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
]

/**
 * Searches from the current working directory up until finding the
 * given flat config filename.
 *
 * @see {@link https://github.com/eslint/eslint/blob/38c159e7dda812ce6dfdbf8c5b78db7cdd676c62/lib/eslint/eslint.js#L260-L271}
 *
 * @returns {string|undefined} The filename if found or `undefined` if not.
 */
function findFlatConfigFileSync () {
  return findUp.sync(FLAT_CONFIG_FILENAMES)
}

/**
 * @returns {string[]}
 */
function resolveIgnoresFromGitignore () {
  const configFile = findFlatConfigFileSync()

  if (!configFile) {
    return []
  }

  /** @type {string[]} */
  const result = []

  try {
    const content = readFileSync(path.join(path.dirname(configFile), '.gitignore'), 'utf8')

    for (let line of content.split('\n')) {
      line = line.trim()

      if (line && !line.startsWith('#')) {
        result.push(gitignoreToMinimatch(line))
      }
    }
  } catch {}

  return result
}

module.exports = {
  resolveIgnoresFromGitignore,
}
