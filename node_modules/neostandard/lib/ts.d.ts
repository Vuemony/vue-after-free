export type TypescriptifyOptions = {
    files?: import("typescript-eslint").ConfigWithExtends["files"];
    ignores?: string[] | undefined;
    name?: string;
    project?: string[] | string | boolean | null;
    tsconfigRootDir?: string;
    typeChecking?: boolean;
};
export function typescriptify(configs: import("eslint").Linter.Config[], options: TypescriptifyOptions): import("eslint").Linter.Config;
//# sourceMappingURL=ts.d.ts.map