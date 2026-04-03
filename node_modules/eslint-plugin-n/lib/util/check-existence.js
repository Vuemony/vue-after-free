/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const getAllowModules = require("./get-allow-modules")

/**
 * Reports a missing file from ImportTarget
 * @param {import('eslint').Rule.RuleContext} context - A context to report.
 * @param {import('../util/import-target.js')} target - A list of target information to check.
 * @returns {void}
 */
function markMissing(context, target) {
    // This should never happen... this is just a fallback for typescript
    target.resolveError ??= `"${target.name}" is not found`

    context.report({
        node: target.node,
        messageId: "notFound",
        data: { resolveError: target.resolveError },
    })
}

/**
 * Checks whether or not each requirement target exists.
 *
 * It looks up the target according to the logic of Node.js.
 * See Also: https://nodejs.org/api/modules.html
 *
 * @param {import('eslint').Rule.RuleContext} context - A context to report.
 * @param {import('../util/import-target.js')[]} targets - A list of target information to check.
 * @returns {void}
 */
exports.checkExistence = function checkExistence(context, targets) {
    /** @type {Set<string | undefined>} */
    const allowed = new Set(getAllowModules(context))

    for (const target of targets) {
        if (allowed.has(target.moduleName)) {
            continue
        }

        if (target.resolveError != null) {
            markMissing(context, target)
        }
    }
}

exports.messages = {
    notFound: "{{resolveError}}",
}
