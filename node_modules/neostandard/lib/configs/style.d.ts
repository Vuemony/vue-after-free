export let name: string;
export let plugins: {
    '@stylistic': import("eslint").ESLint.Plugin;
};
export let rules: {
    '@stylistic/array-bracket-spacing': ["error", string];
    '@stylistic/arrow-spacing': ["error", {
        before: boolean;
        after: boolean;
    }];
    '@stylistic/block-spacing': ["error", string];
    '@stylistic/brace-style': ["error", string, {
        allowSingleLine: boolean;
    }];
    '@stylistic/comma-dangle': ["error", {
        arrays: string;
        objects: string;
        imports: string;
        exports: string;
        functions: string;
    }];
    '@stylistic/comma-spacing': ["error", {
        before: boolean;
        after: boolean;
    }];
    '@stylistic/comma-style': ["error", string];
    '@stylistic/computed-property-spacing': ["error", string, {
        enforceForClassMembers: boolean;
    }];
    '@stylistic/dot-location': ["error", string];
    '@stylistic/eol-last': "error";
    '@stylistic/func-call-spacing': ["error", string];
    '@stylistic/generator-star-spacing': ["error", {
        before: boolean;
        after: boolean;
    }];
    '@stylistic/indent': ["error", number, {
        SwitchCase: number;
        VariableDeclarator: number;
        outerIIFEBody: number;
        MemberExpression: number;
        FunctionDeclaration: {
            parameters: number;
            body: number;
        };
        FunctionExpression: {
            parameters: number;
            body: number;
        };
        CallExpression: {
            arguments: number;
        };
        ArrayExpression: number;
        ObjectExpression: number;
        ImportDeclaration: number;
        flatTernaryExpressions: boolean;
        ignoreComments: boolean;
        ignoredNodes: string[];
        offsetTernaryExpressions: boolean;
    }];
    '@stylistic/key-spacing': ["error", {
        beforeColon: boolean;
        afterColon: boolean;
    }];
    '@stylistic/keyword-spacing': ["error", {
        before: boolean;
        after: boolean;
    }];
    '@stylistic/lines-between-class-members': ["error", string, {
        exceptAfterSingleLine: boolean;
    }];
    '@stylistic/multiline-ternary': ["error", string];
    '@stylistic/new-parens': "error";
    '@stylistic/no-extra-parens': ["error", string];
    '@stylistic/no-floating-decimal': "error";
    '@stylistic/no-mixed-operators': ["error", {
        groups: string[][];
        allowSamePrecedence: boolean;
    }];
    '@stylistic/no-mixed-spaces-and-tabs': "error";
    '@stylistic/no-multi-spaces': "error";
    '@stylistic/no-multiple-empty-lines': ["error", {
        max: number;
        maxBOF: number;
        maxEOF: number;
    }];
    '@stylistic/no-tabs': "error";
    '@stylistic/no-trailing-spaces': "error";
    '@stylistic/no-whitespace-before-property': "error";
    '@stylistic/object-curly-newline': ["error", {
        multiline: boolean;
        consistent: boolean;
    }];
    '@stylistic/object-curly-spacing': ["error", string];
    '@stylistic/object-property-newline': ["error", {
        allowMultiplePropertiesPerLine: boolean;
    }];
    '@stylistic/operator-linebreak': ["error", string, {
        overrides: {
            '?': string;
            ':': string;
            '|>': string;
        };
    }];
    '@stylistic/padded-blocks': ["error", {
        blocks: string;
        switches: string;
        classes: string;
    }];
    '@stylistic/quote-props': ["error", string];
    '@stylistic/quotes': ["error", string, {
        avoidEscape: boolean;
        allowTemplateLiterals: boolean;
    }];
    '@stylistic/rest-spread-spacing': ["error", string];
    '@stylistic/semi': ["error", string];
    '@stylistic/semi-spacing': ["error", {
        before: boolean;
        after: boolean;
    }];
    '@stylistic/space-before-blocks': ["error", string];
    '@stylistic/space-before-function-paren': ["error", string];
    '@stylistic/space-in-parens': ["error", string];
    '@stylistic/space-infix-ops': "error";
    '@stylistic/space-unary-ops': ["error", {
        words: boolean;
        nonwords: boolean;
    }];
    '@stylistic/spaced-comment': ["error", string, {
        line: {
            markers: string[];
        };
        block: {
            balanced: boolean;
            markers: string[];
            exceptions: string[];
        };
    }];
    '@stylistic/template-curly-spacing': ["error", string];
    '@stylistic/template-tag-spacing': ["error", string];
    '@stylistic/wrap-iife': ["error", string, {
        functionPrototypeMethods: boolean;
    }];
    '@stylistic/yield-star-spacing': ["error", string];
};
//# sourceMappingURL=style.d.ts.map