/**
 * @fileoverview the rule has been renamed to `hashbang`. Please use `hashbang` instead.
 * @deprecated
 * @author 唯然<weiran.zsd@outlook.com>
 */
"use strict"

const hashbang = require("./hashbang.js")

module.exports = {
    meta: {
        ...hashbang.meta,
        deprecated: true,
        replacedBy: ["n/hashbang"],
        docs: { ...hashbang.meta?.docs, recommended: false },
    },
    create: hashbang.create,
}
