import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import neostandard from 'neostandard'

export default defineConfig([
  {
    ignores: ['**/vid/**/*.ts', '**/video/**/*.ts'], // Ignore MPEG-TS video files
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
        jsmaf: 'readonly',
        log: 'readonly',
      }
    },
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  tseslint.configs.recommended,
  neostandard({
    ts: true,
    env: ['browser', 'es2015'],
  }),
  {
    rules: {

      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],

      '@stylistic/quote-props': ['error', 'consistent-as-needed'],

      'quotes': 'off',
      'quote-props': 'off',

      'camelcase': 'off',
      'no-unused-vars': 'off',
      'no-var': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unused-expressions': 'off',
      'no-fallthrough': 'off',
      'no-new-native-nonconstructor': 'off',
      'no-extend-native': 'off',
      'no-new': 'off',

      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
])
