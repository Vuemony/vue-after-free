import IdGenerator = require("./id-generator");

export = ForkContext;
/**
 * Manages the forking of code paths.
 */
declare class ForkContext {
    /**
     * Creates a new root context, meaning that there are no parent
     * fork contexts.
     * @param {IdGenerator} idGenerator An identifier generator for segments.
     * @returns {ForkContext} New fork context.
     */
    static newRoot(idGenerator: IdGenerator): ForkContext;
    /**
     * Creates an empty fork context preceded by a given context.
     * @param {ForkContext} parentContext The parent fork context.
     * @param {boolean} shouldForkLeavingPath Indicates that we are inside of
     *      a `finally` block and should therefore fork the path that leaves
     *      `finally`.
     * @returns {ForkContext} New fork context.
     */
    static newEmpty(parentContext: ForkContext, shouldForkLeavingPath: boolean): ForkContext;
    /**
     * Creates a new instance.
     * @param {IdGenerator} idGenerator An identifier generator for segments.
     * @param {ForkContext|null} upper The preceding fork context.
     * @param {number} count The number of parallel segments in each element
     *      of `segmentsList`.
     */
    constructor(idGenerator: IdGenerator, upper: ForkContext | null, count: number);
    /**
     * The ID generator that will generate segment IDs for any new
     * segments that are created.
     * @type {IdGenerator}
     */
    idGenerator: IdGenerator;
    /**
     * The preceding fork context.
     * @type {ForkContext|null}
     */
    upper: ForkContext | null;
    /**
     * The number of elements in each element of `segmentsList`. In most
     * cases, this is 1 but can be 2 when there is a `finally` present,
     * which forks the code path outside of normal flow. In the case of nested
     * `finally` blocks, this can be a multiple of 2.
     * @type {number}
     */
    count: number;
    /**
     * The segments within this context. Each element in this array has
     * `count` elements that represent one step in each fork. For example,
     * when `segmentsList` is `[[a, b], [c, d], [e, f]]`, there is one path
     * a->c->e and one path b->d->f, and `count` is 2 because each element
     * is an array with two elements.
     * @type {Array<Array<CodePathSegment>>}
     */
    segmentsList: Array<Array<CodePathSegment>>;
    /**
     * The segments that begin this fork context.
     * @type {Array<CodePathSegment>}
     */
    get head(): CodePathSegment[];
    /**
     * Indicates if the context contains no segments.
     * @type {boolean}
     */
    get empty(): boolean;
    /**
     * Indicates if there are any segments that are reachable.
     * @type {boolean}
     */
    get reachable(): boolean;
    /**
     * Creates new segments in this context and appends them to the end of the
     * already existing `CodePathSegment`s specified by `startIndex` and
     * `endIndex`.
     * @param {number} startIndex The index of the first segment in the context
     *      that should be specified as previous segments for the newly created segments.
     * @param {number} endIndex The index of the last segment in the context
     *      that should be specified as previous segments for the newly created segments.
     * @returns {Array<CodePathSegment>} An array of the newly created segments.
     */
    makeNext(startIndex: number, endIndex: number): Array<CodePathSegment>;
    /**
     * Creates new unreachable segments in this context and appends them to the end of the
     * already existing `CodePathSegment`s specified by `startIndex` and
     * `endIndex`.
     * @param {number} startIndex The index of the first segment in the context
     *      that should be specified as previous segments for the newly created segments.
     * @param {number} endIndex The index of the last segment in the context
     *      that should be specified as previous segments for the newly created segments.
     * @returns {Array<CodePathSegment>} An array of the newly created segments.
     */
    makeUnreachable(startIndex: number, endIndex: number): Array<CodePathSegment>;
    /**
     * Creates new segments in this context and does not append them to the end
     *  of the already existing `CodePathSegment`s specified by `startIndex` and
     * `endIndex`. The `startIndex` and `endIndex` are only used to determine if
     * the new segments should be reachable. If any of the segments in this range
     * are reachable then the new segments are also reachable; otherwise, the new
     * segments are unreachable.
     * @param {number} startIndex The index of the first segment in the context
     *      that should be considered for reachability.
     * @param {number} endIndex The index of the last segment in the context
     *      that should be considered for reachability.
     * @returns {Array<CodePathSegment>} An array of the newly created segments.
     */
    makeDisconnected(startIndex: number, endIndex: number): Array<CodePathSegment>;
    /**
     * Adds segments to the head of this context.
     * @param {Array<CodePathSegment>} segments The segments to add.
     * @returns {void}
     */
    add(segments: Array<CodePathSegment>): void;
    /**
     * Replaces the head segments with the given segments.
     * The current head segments are removed.
     * @param {Array<CodePathSegment>} replacementHeadSegments The new head segments.
     * @returns {void}
     */
    replaceHead(replacementHeadSegments: Array<CodePathSegment>): void;
    /**
     * Adds all segments of a given fork context into this context.
     * @param {ForkContext} otherForkContext The fork context to add from.
     * @returns {void}
     */
    addAll(otherForkContext: ForkContext): void;
    /**
     * Clears all segments in this context.
     * @returns {void}
     */
    clear(): void;
}
import CodePathSegment = require("./code-path-segment");
