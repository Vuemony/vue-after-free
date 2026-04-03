'use strict'

module.exports = /** @satisfies {import('eslint').Linter.Config} */({
  name: 'neostandard/semi',

  rules: {
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/no-extra-semi': 'error',
  },
})
