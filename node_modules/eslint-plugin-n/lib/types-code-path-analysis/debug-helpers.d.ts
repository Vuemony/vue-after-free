import CodePath = require("./code-path");

declare const debug: any;
export declare let enabled: boolean;
export { debug as dump };
export declare let dumpState: any;
export declare let dumpDot: any;
/**
 * Makes a DOT code of a given code path.
 * The DOT code can be visualized with Graphvis.
 * @param {CodePath} codePath A code path to make DOT.
 * @param {Object} traceMap Optional. A map to check whether or not segments had been done.
 * @returns {string} A DOT code of the code path.
 */
export declare function makeDotArrows(codePath: CodePath, traceMap: any): string;
