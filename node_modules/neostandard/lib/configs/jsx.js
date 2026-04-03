'use strict'

const reactPlugin = require('eslint-plugin-react')

const JSX_IGNORES = ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts']

module.exports.jsx = /** @satisfies {import('eslint').Linter.Config} */ ({
  name: 'neostandard/jsx',

  ignores: [...JSX_IGNORES],

  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },

  plugins: {
    react: /** @type {import('eslint').ESLint.Plugin} */ (reactPlugin),
  },

  settings: {
    react: {
      version: '17',
    },
    linkComponents: [
      'Link',
    ],
  },

  rules: {
    'react/jsx-boolean-value': 'error',
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-handler-names': 'error',
    'react/jsx-key': ['error', {
      checkFragmentShorthand: true,
    }],
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],
    'react/jsx-no-undef': ['error', { allowGlobals: true }],
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-string-refs': ['error', {
      noTemplateLiterals: true,
    }],
    'react/no-unescaped-entities': ['error', {
      forbid: ['>', '}'],
    }],
    'react/no-render-return-value': 'error',
    'react/require-render-return': 'error',
    'react/self-closing-comp': 'error',
  },
})

module.exports.jsxStyles = /** @satisfies {import('eslint').Linter.Config} */ ({
  name: 'neostandard/style/jsx',

  ignores: [...JSX_IGNORES],

  rules: {
    '@stylistic/jsx-quotes': ['error', 'prefer-single'],
    '@stylistic/jsx-closing-bracket-location': ['error', 'tag-aligned'],
    '@stylistic/jsx-closing-tag-location': 'error',
    '@stylistic/jsx-curly-brace-presence': ['error', {
      props: 'never',
      children: 'never',
    }],
    '@stylistic/jsx-curly-newline': ['error', {
      multiline: 'consistent',
      singleline: 'consistent',
    }],
    '@stylistic/jsx-curly-spacing': ['error', {
      attributes: { when: 'never', allowMultiline: true },
      children: { when: 'never', allowMultiline: true },
    }],
    '@stylistic/jsx-equals-spacing': ['error', 'never'],
    '@stylistic/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
    '@stylistic/jsx-indent': ['error', 2, {
      checkAttributes: false,
      indentLogicalExpressions: true,
    }],
    '@stylistic/jsx-indent-props': ['error', 2],
    '@stylistic/jsx-pascal-case': ['error', { allowAllCaps: false }],
    '@stylistic/jsx-props-no-multi-spaces': 'error',
    '@stylistic/jsx-tag-spacing': ['error', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never',
    }],
    '@stylistic/jsx-wrap-multilines': ['error', {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'ignore',
      condition: 'ignore',
      logical: 'ignore',
      prop: 'ignore',
    }],
  },
})
