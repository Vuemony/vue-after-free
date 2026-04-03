declare namespace _exports {
    export { Configs };
}
declare const _exports: ESLint.Plugin & {
    configs: Configs;
};
export = _exports;
type Configs = {
    "recommended-module": ESLint.ConfigData;
    "recommended-script": ESLint.ConfigData;
    "recommended": ESLint.ConfigData;
    "flat/recommended-module": Linter.Config;
    "flat/recommended-script": Linter.Config;
    "flat/recommended": Linter.Config;
    "flat/mixed-esm-and-cjs": Linter.Config[];
    "flat/all": Linter.Config;
};
import type { ESLint } from 'eslint';
import type { Linter } from 'eslint';
