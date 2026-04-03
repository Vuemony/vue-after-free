'use strict';

var path = require('node:path');
var pm = require('picomatch');
var ts = require('typescript');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

/**
 * Test if the type matches the given specifier.
 */
function typeMatchesSpecifier(program, specifier, type) {
    const [declarations, declarationFiles] = getDeclarations(type);
    switch (specifier.from) {
        case "lib": {
            return isTypeDeclaredInDefaultLib(program, declarationFiles);
        }
        case "package": {
            return (isTypeDeclaredInPackage(program, declarations, declarationFiles, specifier.package) &&
                !isTypeDeclaredInDefaultLib(program, declarationFiles));
        }
        case "file": {
            return (isTypeDeclaredInLocalFile(program, declarationFiles, specifier.path) &&
                !isTypeDeclaredInDefaultLib(program, declarationFiles) &&
                !isTypeDeclaredInPackage(program, declarations, declarationFiles));
        }
    }
}
/**
 * Get the source files that declare the type.
 */
function getDeclarations(type) {
    const declarations = type.getSymbol()?.getDeclarations() ?? [];
    const declarationFiles = declarations.map((declaration) => declaration.getSourceFile());
    return [declarations, declarationFiles];
}
/**
 * Test if the type is declared in a TypeScript default lib.
 */
function isTypeDeclaredInDefaultLib(program, declarationFiles) {
    // Intrinsic type (i.e. string, number, boolean, etc).
    if (declarationFiles.length === 0) {
        return true;
    }
    return declarationFiles.some((declaration) => program.isSourceFileDefaultLibrary(declaration));
}
/**
 * Test if the type is declared in a package.
 */
function isTypeDeclaredInPackage(program, declarations, declarationFiles, packageName) {
    return (isTypeDeclaredInDeclareModule(declarations, packageName) ||
        isTypeDeclaredInPackageDeclarationFile(program, declarationFiles, packageName));
}
/**
 * Test if the type is declared in a declare module.
 */
function isTypeDeclaredInDeclareModule(declarations, packageName) {
    return declarations.some((declaration) => {
        const moduleDeclaration = findParentModuleDeclaration(declaration);
        return (moduleDeclaration !== undefined && (packageName === undefined || moduleDeclaration.name.text === packageName));
    });
}
/**
 * Test if the type is declared in a TypeScript Declaration file of a package.
 */
function isTypeDeclaredInPackageDeclarationFile(program, declarationFiles, packageName) {
    // Handle scoped packages - if the name starts with @, remove it and replace / with __
    const typesPackageName = packageName?.replace(/^@([^/]+)\//u, "$1__");
    const matcher = packageName === undefined
        ? undefined
        : (new RegExp(`${packageName}|${typesPackageName}`, "u"));
    return declarationFiles.some((declaration) => {
        const packageIdName = program.sourceFileToPackageName.get(declaration.path);
        return (packageIdName !== undefined &&
            (matcher === undefined || matcher.test(packageIdName)) &&
            program.isSourceFileFromExternalLibrary(declaration));
    });
}
/**
 * Test if the type is declared in a local file.
 */
function isTypeDeclaredInLocalFile(program, declarationFiles, globPattern) {
    const cwd = program.getCurrentDirectory();
    const typeRoots = ts.getEffectiveTypeRoots(program.getCompilerOptions(), program);
    // Filter out type roots.
    const filteredDeclarationFiles = typeRoots === undefined
        ? declarationFiles
        : declarationFiles.filter((declaration) => !typeRoots.some((typeRoot) => declaration.path.startsWith(typeRoot)));
    if (globPattern === undefined) {
        return filteredDeclarationFiles.some((declaration) => !declaration.path.includes("/node_modules/"));
    }
    return filteredDeclarationFiles.some((declaration) => {
        const canonicalPath = getCanonicalFilePath(declaration.path);
        return (canonicalPath.startsWith(cwd) &&
            (pm.isMatch(canonicalPath, globPattern) || pm.isMatch(`./${path__namespace.relative(cwd, canonicalPath)}`, globPattern)));
    });
}
/**
 * Search up the tree for a module declaration.
 */
function findParentModuleDeclaration(node) {
    switch (node.kind) {
        case ts.SyntaxKind.ModuleDeclaration: {
            return ts.isStringLiteral(node.name) ? node : undefined;
        }
        case ts.SyntaxKind.SourceFile: {
            return undefined;
        }
        default: {
            return findParentModuleDeclaration(node.parent);
        }
    }
}
/**
 * Clean up a file path so it can be matched against as users expect.
 */
function getCanonicalFilePath(filePath) {
    const normalized = path__namespace.normalize(filePath);
    const normalizedWithoutTrailingSlash = normalized.endsWith(path__namespace.sep) ? normalized.slice(0, -1) : normalized;
    const useCaseSensitiveFileNames = 
    // eslint-disable-next-line ts/no-unnecessary-condition
    ts.sys === undefined ? true : ts.sys.useCaseSensitiveFileNames;
    if (useCaseSensitiveFileNames) {
        return normalizedWithoutTrailingSlash;
    }
    return normalizedWithoutTrailingSlash.toLowerCase();
}

module.exports = typeMatchesSpecifier;
