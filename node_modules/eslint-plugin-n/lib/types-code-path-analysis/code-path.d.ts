import CodePathSegment = require("./code-path-segment");

export = CodePath;
/**
 * A code path.
 */
declare class CodePath {
    /**
     * Gets the state of a given code path.
     * @param {CodePath} codePath A code path to get.
     * @returns {CodePathState} The state of the code path.
     */
    static getState(codePath: CodePath): CodePathState;
    /**
     * Creates a new instance.
     * @param {Object} options Options for the function (see below).
     * @param {string} options.id An identifier.
     * @param {string} options.origin The type of code path origin.
     * @param {CodePath|null} options.upper The code path of the upper function scope.
     * @param {Function} options.onLooped A callback function to notify looping.
     */
    constructor({ id, origin, upper, onLooped }: {
        id: string;
        origin: string;
        upper: CodePath | null;
        onLooped: Function;
    });
    /**
     * The identifier of this code path.
     * Rules use it to store additional information of each rule.
     * @type {string}
     */
    id: string;
    /**
     * The reason that this code path was started. May be "program",
     * "function", "class-field-initializer", or "class-static-block".
     * @type {string}
     */
    origin: string;
    /**
     * The code path of the upper function scope.
     * @type {CodePath|null}
     */
    upper: CodePath | null;
    /**
     * The code paths of nested function scopes.
     * @type {CodePath[]}
     */
    childCodePaths: CodePath[];
    /**
     * The initial code path segment. This is the segment that is at the head
     * of the code path.
     * This is a passthrough to the underlying `CodePathState`.
     * @type {CodePathSegment}
     */
    get initialSegment(): CodePathSegment;
    /**
     * Final code path segments. These are the terminal (tail) segments in the
     * code path, which is the combination of `returnedSegments` and `thrownSegments`.
     * All segments in this array are reachable.
     * This is a passthrough to the underlying `CodePathState`.
     * @type {CodePathSegment[]}
     */
    get finalSegments(): CodePathSegment[];
    /**
     * Final code path segments that represent normal completion of the code path.
     * For functions, this means both explicit `return` statements and implicit returns,
     * such as the last reachable segment in a function that does not have an
     * explicit `return` as this implicitly returns `undefined`. For scripts,
     * modules, class field initializers, and class static blocks, this means
     * all lines of code have been executed.
     * These segments are also present in `finalSegments`.
     * This is a passthrough to the underlying `CodePathState`.
     * @type {CodePathSegment[]}
     */
    get returnedSegments(): CodePathSegment[];
    /**
     * Final code path segments that represent `throw` statements.
     * This is a passthrough to the underlying `CodePathState`.
     * These segments are also present in `finalSegments`.
     * @type {CodePathSegment[]}
     */
    get thrownSegments(): CodePathSegment[];
    /**
     * Traverses all segments in this code path.
     *
     *     codePath.traverseSegments((segment, controller) => {
     *         // do something.
     *     });
     *
     * This method enumerates segments in order from the head.
     *
     * The `controller` argument has two methods:
     *
     * - `skip()` - skips the following segments in this branch
     * - `break()` - skips all following segments in the traversal
     *
     * A note on the parameters: the `options` argument is optional. This means
     * the first argument might be an options object or the callback function.
     * @param {Object} [optionsOrCallback] Optional first and last segments to traverse.
     * @param {CodePathSegment} [optionsOrCallback.first] The first segment to traverse.
     * @param {CodePathSegment} [optionsOrCallback.last] The last segment to traverse.
     * @param {Function} callback A callback function.
     * @returns {void}
     */
    traverseSegments(optionsOrCallback: {
        first?: CodePathSegment;
        last?: CodePathSegment;
    } | Function, callback?: Function): void;
}
import CodePathState = require("./code-path-state");
