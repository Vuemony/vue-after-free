'use strict'

module.exports.modernization = /** @satisfies {import('eslint').Linter.Config} */ ({
  name: 'neostandard/modernization-since-standard-17',

  rules: {
    'dot-notation': 'off',
    // Caused many regressions
    // 'no-unused-vars': ['error', {
    //   vars: 'all',
    //   args: 'all',
    //   argsIgnorePattern: '^_',
    //   ignoreRestSiblings: true,
    // }],
    'n/no-deprecated-api': 'warn',
  },
})

module.exports.modernizationStyles = /** @satisfies {import('eslint').Linter.Config} */ ({
  name: 'neostandard/style/modernization-since-standard-17',

  rules: {
    '@stylistic/comma-dangle': ['warn', {
      // See https://github.com/neostandard/neostandard/issues/79 for reason behind "ignore"
      arrays: 'ignore',
      enums: 'ignore',
      exports: 'ignore',
      imports: 'ignore',
      objects: 'ignore',
    }],
    '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: true }],
  },
})
