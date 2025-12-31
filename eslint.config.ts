import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import neostandard from 'neostandard'

export default defineConfig([
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
      camelcase: 'off',
      'no-unused-vars': 'off', // jsmaf, log, psn, all defined globally
      'no-var': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unused-expressions': 'off',
      'no-fallthrough': 'off',
      'no-new-native-nonconstructor': 'off', // we use our own BigInt
      'no-extend-native': 'off', // we extend native for better usage

      // TS duplicates
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
])
