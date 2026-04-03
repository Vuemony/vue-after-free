"use strict"

const rules = require("../all-rules")

/** @type {import('eslint').Linter.RulesRecord} */
const recommendeRulesConfig = {}

/** @type {import('eslint').Linter.RulesRecord} */
const allRulesConfig = {}

for (const [ruleName, rule] of Object.entries(rules)) {
    const scopedRuleName = `n/${ruleName}`
    // only non-deprecated rules
    if (rule.meta?.deprecated !== true) {
        allRulesConfig[scopedRuleName] = "error"

        if (rule.meta?.docs?.recommended === true) {
            recommendeRulesConfig[scopedRuleName] = "error"
        }
    }
}

exports.recommendeRulesConfig = recommendeRulesConfig
exports.allRulesConfig = allRulesConfig
