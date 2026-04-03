declare module "eslint-plugin-es-x" {
    export const rules: NonNullable<import('eslint').ESLint.Plugin["rules"]>;
}

declare module "@eslint-community/eslint-utils" {
    import * as estree from 'estree';
    import * as eslint from 'eslint';

    type Node = estree.Node | estree.Expression;

    export const READ: unique symbol;
    export const CALL: unique symbol;
    export const CONSTRUCT: unique symbol;
    export const ESM: unique symbol;
    export class ReferenceTracker {
        constructor(globalScope: eslint.Scope.Scope, { mode, globalObjectNames, }?: {
            mode?: "legacy" | "strict" | undefined;
            globalObjectNames?: string[] | undefined;
        } | undefined);
        variableStack: eslint.Scope.Variable[];
        globalScope: eslint.Scope.Scope;
        mode: "legacy" | "strict";
        globalObjectNames: string[];
        iterateGlobalReferences<Info extends unknown>(traceMap: TraceMap<Info>): IterableIterator<Reference<Info>>;
        iterateCjsReferences<Info extends unknown>(traceMap: TraceMap<Info>): IterableIterator<Reference<Info>>;
        iterateEsmReferences<Info extends unknown>(traceMap: TraceMap<Info>): IterableIterator<Reference<Info>>;
        iteratePropertyReferences<Info extends unknown>(node: estree.Expression, traceMap: TraceMap<Info>): IterableIterator<Reference<Info>>;
    }
    export namespace ReferenceTracker {
        export { READ };
        export { CALL };
        export { CONSTRUCT };
        export { ESM };
    }
    type ReferenceType = typeof READ | typeof CALL | typeof CONSTRUCT;
    type TraceMap<Info extends unknown> = {
        [READ]?: Info;
        [CALL]?: Info;
        [CONSTRUCT]?: Info;
        [key: string]: TraceMap<Info> | undefined;
    }
    type RichNode = eslint.Rule.Node | Node;
    type Reference<Info extends unknown> = {
        node: RichNode;
        path: string[];
        type: ReferenceType;
        info: Info;
    };

    export function findVariable(initialScope: eslint.Scope.Scope, nameOrNode: string | Node): eslint.Scope.Variable | null;

    export function getFunctionHeadLocation(node: Extract<eslint.Rule.Node, {
        type: 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression';
    }>, sourceCode: eslint.SourceCode): eslint.AST.SourceLocation | null;

    export function getFunctionNameWithKind(node: Extract<eslint.Rule.Node, {
        type: 'FunctionDeclaration' | 'FunctionExpression' | 'ArrowFunctionExpression';
    }>, sourceCode?: eslint.SourceCode | undefined): string;

    export function getInnermostScope(initialScope: eslint.Scope.Scope, node: Node): eslint.Scope.Scope;

    export function getPropertyName(node: Extract<Node, {
        type: 'MemberExpression' | 'Property' | 'MethodDefinition' | 'PropertyDefinition';
    }>, initialScope?: eslint.Scope.Scope | undefined): string | null;

    export function getStaticValue(node: Node, initialScope?: eslint.Scope.Scope | null | undefined): {
        value: unknown;
        optional?: never;
    } | {
        value: undefined;
        optional?: true;
    } | null;

    export function getStringIfConstant(node: Node, initialScope?: eslint.Scope.Scope | null | undefined): string | null;

    export function hasSideEffect(node: eslint.Rule.Node, sourceCode: eslint.SourceCode, { considerGetters, considerImplicitTypeConversion }?: VisitOptions | undefined): boolean;
    type VisitOptions = {
        considerGetters?: boolean | undefined;
        considerImplicitTypeConversion?: boolean | undefined;
    };
}
