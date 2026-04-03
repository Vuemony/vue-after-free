export namespace modernization {
    let name: string;
    let rules: {
        'dot-notation': "off";
        'n/no-deprecated-api': "warn";
    };
}
export namespace modernizationStyles {
    let name_1: string;
    export { name_1 as name };
    let rules_1: {
        '@stylistic/comma-dangle': ["warn", {
            arrays: string;
            enums: string;
            exports: string;
            imports: string;
            objects: string;
        }];
        '@stylistic/no-multi-spaces': ["error", {
            ignoreEOLComments: boolean;
        }];
    };
    export { rules_1 as rules };
}
//# sourceMappingURL=modernization.d.ts.map