'use strict'

// From https://github.com/typescript-eslint/typescript-eslint/blob/d4504c849eaf309b795c63665cd2cdefa9eeb339/packages/eslint-plugin/src/configs/eslint-recommended-raw.ts#L23C1-L40C67
module.exports = /** @type {Record<string, 'off'>} */ ({
  'getter-return': 'off', // ts(2378)
  'constructor-super': 'off', // ts(2335) & ts(2377)
  'no-const-assign': 'off', // ts(2588)
  'no-dupe-args': 'off', // ts(2300)
  'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
  'no-dupe-keys': 'off', // ts(1117)
  'no-func-assign': 'off', // ts(2630)
  'no-import-assign': 'off', // ts(2632) & ts(2540)
  'no-new-native-nonconstructor': 'off', // ts(7009)
  'no-obj-calls': 'off', // ts(2349)
  'no-redeclare': 'off', // ts(2451)
  'no-setter-return': 'off', // ts(2408)
  'no-this-before-super': 'off', // ts(2376) & ts(17009)
  // See https://typescript-eslint.io/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
  'no-undef': 'off', // ts(2304) & ts(2552)
  'no-unreachable': 'off', // ts(7027)
  'no-unsafe-negation': 'off', // ts(2365) & ts(2322) & ts(2358)
})
