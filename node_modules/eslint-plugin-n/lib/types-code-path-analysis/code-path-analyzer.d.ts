export = CodePathAnalyzer;

interface EventGenerator {
    emitter: import('node:events').EventEmitter;
    enterNode(node: import('eslint').Rule.Node): void;
    leaveNode(node: import('eslint').Rule.Node): void;
}

/**
 * The class to analyze code paths.
 * This class implements the EventGenerator interface.
 */
declare class CodePathAnalyzer {
    /**
     * @param {EventGenerator} eventGenerator An event generator to wrap.
     */
    constructor(eventGenerator: EventGenerator);
    original: EventGenerator;
    emitter: any;
    codePath: any;
    idGenerator: IdGenerator;
    currentNode: any;
    /**
     * This is called on a code path looped.
     * Then this raises a looped event.
     * @param {CodePathSegment} fromSegment A segment of prev.
     * @param {CodePathSegment} toSegment A segment of next.
     * @returns {void}
     */
    onLooped(fromSegment: CodePathSegment, toSegment: CodePathSegment): void;
    /**
     * Does the process to enter a given AST node.
     * This updates state of analysis and calls `enterNode` of the wrapped.
     * @param {ASTNode} node A node which is entering.
     * @returns {void}
     */
    enterNode(node: import('eslint').Rule.Node): void;
    /**
     * Does the process to leave a given AST node.
     * This updates state of analysis and calls `leaveNode` of the wrapped.
     * @param {ASTNode} node A node which is leaving.
     * @returns {void}
     */
    leaveNode(node: import('eslint').Rule.Node): void;
}
import IdGenerator = require("./id-generator");
import CodePathSegment = require("./code-path-segment");
