/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
"use strict"

const { READ } = require("@eslint-community/eslint-utils")
const {
    checkUnsupportedBuiltins,
    messages,
} = require("../../util/check-unsupported-builtins")
const enumeratePropertyNames = require("../../util/enumerate-property-names")
const getConfiguredNodeVersion = require("../../util/get-configured-node-version")

/** @type {Record<'globals' | 'modules', import('../../unsupported-features/types.js').SupportVersionTraceMap>} */
const traceMap = {
    globals: {
        // Core js builtins
        AggregateError: {
            [READ]: { supported: ["15.0.0"] },
        },
        Array: {
            [READ]: { supported: ["0.10.0"] },
            from: { [READ]: { supported: ["4.0.0"] } },
            isArray: { [READ]: { supported: ["0.10.0"] } },
            length: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
            toLocaleString: { [READ]: { supported: ["0.10.0"] } },
        },
        ArrayBuffer: {
            [READ]: { supported: ["0.10.0"] },
            isView: { [READ]: { supported: ["4.0.0"] } },
        },
        Atomics: {
            [READ]: { supported: ["8.10.0"] },
            add: { [READ]: { supported: ["8.10.0"] } },
            and: { [READ]: { supported: ["8.10.0"] } },
            compareExchange: { [READ]: { supported: ["8.10.0"] } },
            exchange: { [READ]: { supported: ["8.10.0"] } },
            isLockFree: { [READ]: { supported: ["8.10.0"] } },
            load: { [READ]: { supported: ["8.10.0"] } },
            notify: { [READ]: { supported: ["8.10.0"] } },
            or: { [READ]: { supported: ["8.10.0"] } },
            store: { [READ]: { supported: ["8.10.0"] } },
            sub: { [READ]: { supported: ["8.10.0"] } },
            wait: { [READ]: { supported: ["8.10.0"] } },
            waitAsync: { [READ]: { supported: ["16.0.0"] } },
            xor: { [READ]: { supported: ["8.10.0"] } },
        },
        BigInt: {
            [READ]: { supported: ["10.4.0"] },
            asIntN: { [READ]: { supported: ["10.4.0"] } },
            asUintN: { [READ]: { supported: ["10.4.0"] } },
        },
        BigInt64Array: {
            [READ]: { supported: ["10.4.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        BigUint64Array: {
            [READ]: { supported: ["10.4.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Boolean: {
            [READ]: { supported: ["0.10.0"] },
        },
        DataView: {
            [READ]: { supported: ["0.10.0"] },
        },
        Date: {
            [READ]: { supported: ["0.10.0"] },
            UTC: { [READ]: { supported: ["0.10.0"] } },
            now: { [READ]: { supported: ["0.10.0"] } },
            parse: { [READ]: { supported: ["0.10.0"] } },
            toLocaleDateString: { [READ]: { supported: ["0.10.0"] } },
            toLocaleString: { [READ]: { supported: ["0.10.0"] } },
            toLocaleTimeString: { [READ]: { supported: ["0.10.0"] } },
        },
        Error: {
            [READ]: { supported: ["0.10.0"] },
            cause: { [READ]: { supported: ["16.9.0"] } },
        },
        EvalError: {
            [READ]: { supported: ["0.10.0"] },
        },
        FinalizationRegistry: {
            [READ]: { supported: ["14.6.0"] },
        },
        Float32Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Float64Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Function: {
            [READ]: { supported: ["0.10.0"] },
            length: { [READ]: { supported: ["0.10.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
        },
        Infinity: {
            [READ]: { supported: ["0.10.0"] },
        },
        Int16Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Int32Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Int8Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Intl: {
            [READ]: { supported: ["0.12.0"] },
            Collator: { [READ]: { supported: ["0.12.0"] } },
            DateTimeFormat: { [READ]: { supported: ["0.12.0"] } },
            DisplayNames: { [READ]: { supported: ["14.0.0"] } },
            ListFormat: { [READ]: { supported: ["12.0.0"] } },
            Locale: { [READ]: { supported: ["12.0.0"] } },
            NumberFormat: { [READ]: { supported: ["0.12.0"] } },
            PluralRules: { [READ]: { supported: ["10.0.0"] } },
            RelativeTimeFormat: { [READ]: { supported: ["12.0.0"] } },
            Segmenter: { [READ]: { supported: ["16.0.0"] } },
            Segments: { [READ]: { supported: ["16.0.0"] } },
            getCanonicalLocales: { [READ]: { supported: ["7.0.0"] } },
            supportedValuesOf: { [READ]: { supported: ["18.0.0"] } },
        },
        JSON: {
            [READ]: { supported: ["0.10.0"] },
            parse: { [READ]: { supported: ["0.10.0"] } },
            stringify: { [READ]: { supported: ["0.10.0"] } },
        },
        Map: {
            [READ]: { supported: ["0.12.0"] },
            groupBy: { [READ]: { supported: ["21.0.0"] } },
        },
        Math: {
            [READ]: { supported: ["0.10.0"] },
            E: { [READ]: { supported: ["0.10.0"] } },
            LN10: { [READ]: { supported: ["0.10.0"] } },
            LN2: { [READ]: { supported: ["0.10.0"] } },
            LOG10E: { [READ]: { supported: ["0.10.0"] } },
            LOG2E: { [READ]: { supported: ["0.10.0"] } },
            PI: { [READ]: { supported: ["0.10.0"] } },
            SQRT1_2: { [READ]: { supported: ["0.10.0"] } },
            SQRT2: { [READ]: { supported: ["0.10.0"] } },
            abs: { [READ]: { supported: ["0.10.0"] } },
            acos: { [READ]: { supported: ["0.10.0"] } },
            acosh: { [READ]: { supported: ["0.12.0"] } },
            asin: { [READ]: { supported: ["0.10.0"] } },
            asinh: { [READ]: { supported: ["0.12.0"] } },
            atan: { [READ]: { supported: ["0.10.0"] } },
            atan2: { [READ]: { supported: ["0.10.0"] } },
            atanh: { [READ]: { supported: ["0.12.0"] } },
            cbrt: { [READ]: { supported: ["0.12.0"] } },
            ceil: { [READ]: { supported: ["0.10.0"] } },
            clz32: { [READ]: { supported: ["0.12.0"] } },
            cos: { [READ]: { supported: ["0.10.0"] } },
            cosh: { [READ]: { supported: ["0.12.0"] } },
            exp: { [READ]: { supported: ["0.10.0"] } },
            expm1: { [READ]: { supported: ["0.12.0"] } },
            floor: { [READ]: { supported: ["0.10.0"] } },
            fround: { [READ]: { supported: ["0.12.0"] } },
            hypot: { [READ]: { supported: ["0.12.0"] } },
            imul: { [READ]: { supported: ["0.12.0"] } },
            log: { [READ]: { supported: ["0.10.0"] } },
            log10: { [READ]: { supported: ["0.12.0"] } },
            log1p: { [READ]: { supported: ["0.12.0"] } },
            log2: { [READ]: { supported: ["0.12.0"] } },
            max: { [READ]: { supported: ["0.10.0"] } },
            min: { [READ]: { supported: ["0.10.0"] } },
            pow: { [READ]: { supported: ["0.10.0"] } },
            random: { [READ]: { supported: ["0.10.0"] } },
            round: { [READ]: { supported: ["0.10.0"] } },
            sign: { [READ]: { supported: ["0.12.0"] } },
            sin: { [READ]: { supported: ["0.10.0"] } },
            sinh: { [READ]: { supported: ["0.12.0"] } },
            sqrt: { [READ]: { supported: ["0.10.0"] } },
            tan: { [READ]: { supported: ["0.10.0"] } },
            tanh: { [READ]: { supported: ["0.12.0"] } },
            trunc: { [READ]: { supported: ["0.12.0"] } },
        },
        NaN: {
            [READ]: { supported: ["0.10.0"] },
        },
        Number: {
            // [READ]: { supported: [ "0.10.0" ] },
            EPSILON: { [READ]: { supported: ["0.12.0"] } },
            MAX_SAFE_INTEGER: { [READ]: { supported: ["0.12.0"] } },
            MAX_VALUE: { [READ]: { supported: ["0.10.0"] } },
            MIN_SAFE_INTEGER: { [READ]: { supported: ["0.12.0"] } },
            MIN_VALUE: { [READ]: { supported: ["0.10.0"] } },
            NEGATIVE_INFINITY: { [READ]: { supported: ["0.10.0"] } },
            NaN: { [READ]: { supported: ["0.10.0"] } },
            POSITIVE_INFINITY: { [READ]: { supported: ["0.10.0"] } },
            isFinite: { [READ]: { supported: ["0.10.0"] } },
            isInteger: { [READ]: { supported: ["0.12.0"] } },
            isNaN: { [READ]: { supported: ["0.10.0"] } },
            isSafeInteger: { [READ]: { supported: ["0.12.0"] } },
            parseFloat: { [READ]: { supported: ["0.12.0"] } },
            parseInt: { [READ]: { supported: ["0.12.0"] } },
            toLocaleString: { [READ]: { supported: ["0.10.0"] } },
        },
        Object: {
            // [READ]: { supported: [ "0.10.0" ] },
            assign: { [READ]: { supported: ["4.0.0"] } },
            create: { [READ]: { supported: ["0.10.0"] } },
            defineGetter: { [READ]: { supported: ["0.10.0"] } },
            defineProperties: { [READ]: { supported: ["0.10.0"] } },
            defineProperty: { [READ]: { supported: ["0.10.0"] } },
            defineSetter: { [READ]: { supported: ["0.10.0"] } },
            entries: { [READ]: { supported: ["7.0.0"] } },
            freeze: { [READ]: { supported: ["0.10.0"] } },
            fromEntries: { [READ]: { supported: ["12.0.0"] } },
            getOwnPropertyDescriptor: { [READ]: { supported: ["0.10.0"] } },
            getOwnPropertyDescriptors: { [READ]: { supported: ["7.0.0"] } },
            getOwnPropertyNames: { [READ]: { supported: ["0.10.0"] } },
            getOwnPropertySymbols: { [READ]: { supported: ["0.12.0"] } },
            getPrototypeOf: { [READ]: { supported: ["0.10.0"] } },
            groupBy: { [READ]: { supported: ["21.0.0"] } },
            hasOwn: { [READ]: { supported: ["16.9.0"] } },
            is: { [READ]: { supported: ["0.10.0"] } },
            isExtensible: { [READ]: { supported: ["0.10.0"] } },
            isFrozen: { [READ]: { supported: ["0.10.0"] } },
            isSealed: { [READ]: { supported: ["0.10.0"] } },
            keys: { [READ]: { supported: ["0.10.0"] } },
            lookupGetter: { [READ]: { supported: ["0.10.0"] } },
            lookupSetter: { [READ]: { supported: ["0.10.0"] } },
            preventExtensions: { [READ]: { supported: ["0.10.0"] } },
            proto: { [READ]: { supported: ["0.10.0"] } },
            seal: { [READ]: { supported: ["0.10.0"] } },
            setPrototypeOf: { [READ]: { supported: ["0.12.0"] } },
            values: { [READ]: { supported: ["7.0.0"] } },
        },
        Promise: {
            [READ]: { supported: ["0.12.0"] },
            all: { [READ]: { supported: ["0.12.0"] } },
            allSettled: { [READ]: { supported: ["12.9.0"] } },
            any: { [READ]: { supported: ["15.0.0"] } },
            race: { [READ]: { supported: ["0.12.0"] } },
            reject: { [READ]: { supported: ["0.12.0"] } },
            resolve: { [READ]: { supported: ["0.12.0"] } },
        },
        Proxy: {
            [READ]: { supported: ["6.0.0"] },
            revocable: { [READ]: { supported: ["6.0.0"] } },
        },
        RangeError: {
            [READ]: { supported: ["0.10.0"] },
        },
        ReferenceError: {
            [READ]: { supported: ["0.10.0"] },
        },
        Reflect: {
            [READ]: { supported: ["6.0.0"] },
            apply: { [READ]: { supported: ["6.0.0"] } },
            construct: { [READ]: { supported: ["6.0.0"] } },
            defineProperty: { [READ]: { supported: ["6.0.0"] } },
            deleteProperty: { [READ]: { supported: ["6.0.0"] } },
            get: { [READ]: { supported: ["6.0.0"] } },
            getOwnPropertyDescriptor: { [READ]: { supported: ["6.0.0"] } },
            getPrototypeOf: { [READ]: { supported: ["6.0.0"] } },
            has: { [READ]: { supported: ["6.0.0"] } },
            isExtensible: { [READ]: { supported: ["6.0.0"] } },
            ownKeys: { [READ]: { supported: ["6.0.0"] } },
            preventExtensions: { [READ]: { supported: ["6.0.0"] } },
            set: { [READ]: { supported: ["6.0.0"] } },
            setPrototypeOf: { [READ]: { supported: ["6.0.0"] } },
        },
        RegExp: {
            [READ]: { supported: ["0.10.0"] },
            dotAll: { [READ]: { supported: ["8.10.0"] } },
            hasIndices: { [READ]: { supported: ["16.0.0"] } },
            input: { [READ]: { supported: ["0.10.0"] } },
            lastIndex: { [READ]: { supported: ["0.10.0"] } },
            lastMatch: { [READ]: { supported: ["0.10.0"] } },
            lastParen: { [READ]: { supported: ["0.10.0"] } },
            leftContext: { [READ]: { supported: ["0.10.0"] } },
            n: { [READ]: { supported: ["0.10.0"] } },
            rightContext: { [READ]: { supported: ["0.10.0"] } },
        },
        Set: {
            [READ]: { supported: ["0.12.0"] },
        },
        SharedArrayBuffer: {
            [READ]: { supported: ["8.10.0"] },
        },
        String: {
            [READ]: { supported: ["0.10.0"] },
            fromCharCode: { [READ]: { supported: ["0.10.0"] } },
            fromCodePoint: { [READ]: { supported: ["4.0.0"] } },
            length: { [READ]: { supported: ["0.10.0"] } },
            localeCompare: { [READ]: { supported: ["0.10.0"] } },
            raw: { [READ]: { supported: ["4.0.0"] } },
            toLocaleLowerCase: { [READ]: { supported: ["0.10.0"] } },
            toLocaleUpperCase: { [READ]: { supported: ["0.10.0"] } },
        },
        Symbol: {
            [READ]: { supported: ["0.12.0"] },
            asyncIterator: { [READ]: { supported: ["10.0.0"] } },
            for: { [READ]: { supported: ["0.12.0"] } },
            hasInstance: { [READ]: { supported: ["6.5.0"] } },
            isConcatSpreadable: { [READ]: { supported: ["6.0.0"] } },
            iterator: { [READ]: { supported: ["0.12.0"] } },
            keyFor: { [READ]: { supported: ["0.12.0"] } },
            match: { [READ]: { supported: ["6.0.0"] } },
            matchAll: { [READ]: { supported: ["12.0.0"] } },
            replace: { [READ]: { supported: ["6.0.0"] } },
            search: { [READ]: { supported: ["6.0.0"] } },
            species: { [READ]: { supported: ["6.5.0"] } },
            split: { [READ]: { supported: ["6.0.0"] } },
            toPrimitive: { [READ]: { supported: ["6.0.0"] } },
            toStringTag: { [READ]: { supported: ["6.0.0"] } },
            unscopables: { [READ]: { supported: ["0.12.0"] } },
        },
        SyntaxError: {
            [READ]: { supported: ["0.10.0"] },
        },
        TypeError: {
            [READ]: { supported: ["0.10.0"] },
        },
        URIError: {
            [READ]: { supported: ["0.10.0"] },
        },
        Uint16Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Uint32Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Uint8Array: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        Uint8ClampedArray: {
            [READ]: { supported: ["0.10.0"] },
            BYTES_PER_ELEMENT: { [READ]: { supported: ["0.10.0"] } },
            from: { [READ]: { supported: ["4.0.0"] } },
            name: { [READ]: { supported: ["0.10.0"] } },
            of: { [READ]: { supported: ["4.0.0"] } },
        },
        WeakMap: {
            [READ]: { supported: ["0.12.0"] },
        },
        WeakRef: {
            [READ]: { supported: ["14.6.0"] },
        },
        WeakSet: {
            [READ]: { supported: ["0.12.0"] },
        },
        decodeURI: {
            [READ]: { supported: ["0.10.0"] },
        },
        decodeURIComponent: {
            [READ]: { supported: ["0.10.0"] },
        },
        encodeURI: {
            [READ]: { supported: ["0.10.0"] },
        },
        encodeURIComponent: {
            [READ]: { supported: ["0.10.0"] },
        },
        escape: {
            [READ]: { supported: ["0.10.0"] },
        },
        eval: {
            [READ]: { supported: ["0.10.0"] },
        },
        globalThis: {
            [READ]: { supported: ["12.0.0"] },
        },
        isFinite: {
            [READ]: { supported: ["0.10.0"] },
        },
        isNaN: {
            [READ]: { supported: ["0.10.0"] },
        },
        parseFloat: {
            [READ]: { supported: ["0.10.0"] },
        },
        parseInt: {
            [READ]: { supported: ["0.10.0"] },
        },
        unescape: {
            [READ]: { supported: ["0.10.0"] },
        },
    },
    modules: {},
}

/** @type {import('../rule-module').RuleModule} */
module.exports = {
    meta: {
        docs: {
            description:
                "disallow unsupported ECMAScript built-ins on the specified version",
            recommended: true,
            url: "https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-builtins.md",
        },
        type: "problem",
        fixable: null,
        schema: [
            {
                type: "object",
                properties: {
                    version: getConfiguredNodeVersion.schema,
                    ignores: {
                        type: "array",
                        items: {
                            enum: Array.from(
                                enumeratePropertyNames(traceMap.globals)
                            ),
                        },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages,
    },
    create(context) {
        return {
            "Program:exit"() {
                checkUnsupportedBuiltins(context, traceMap)
            },
        }
    },
}
