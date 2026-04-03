export = CodePathSegment;
/**
 * A code path segment.
 *
 * Each segment is arranged in a series of linked lists (implemented by arrays)
 * that keep track of the previous and next segments in a code path. In this way,
 * you can navigate between all segments in any code path so long as you have a
 * reference to any segment in that code path.
 *
 * When first created, the segment is in a detached state, meaning that it knows the
 * segments that came before it but those segments don't know that this new segment
 * follows it. Only when `CodePathSegment#markUsed()` is called on a segment does it
 * officially become part of the code path by updating the previous segments to know
 * that this new segment follows.
 */
declare class CodePathSegment {
    /**
     * Creates the root segment.
     * @param {string} id An identifier.
     * @returns {CodePathSegment} The created segment.
     */
    static newRoot(id: string): CodePathSegment;
    /**
     * Creates a new segment and appends it after the given segments.
     * @param {string} id An identifier.
     * @param {CodePathSegment[]} allPrevSegments An array of the previous segments
     *      to append to.
     * @returns {CodePathSegment} The created segment.
     */
    static newNext(id: string, allPrevSegments: CodePathSegment[]): CodePathSegment;
    /**
     * Creates an unreachable segment and appends it after the given segments.
     * @param {string} id An identifier.
     * @param {CodePathSegment[]} allPrevSegments An array of the previous segments.
     * @returns {CodePathSegment} The created segment.
     */
    static newUnreachable(id: string, allPrevSegments: CodePathSegment[]): CodePathSegment;
    /**
     * Creates a segment that follows given segments.
     * This factory method does not connect with `allPrevSegments`.
     * But this inherits `reachable` flag.
     * @param {string} id An identifier.
     * @param {CodePathSegment[]} allPrevSegments An array of the previous segments.
     * @returns {CodePathSegment} The created segment.
     */
    static newDisconnected(id: string, allPrevSegments: CodePathSegment[]): CodePathSegment;
    /**
     * Marks a given segment as used.
     *
     * And this function registers the segment into the previous segments as a next.
     * @param {CodePathSegment} segment A segment to mark.
     * @returns {void}
     */
    static markUsed(segment: CodePathSegment): void;
    /**
     * Marks a previous segment as looped.
     * @param {CodePathSegment} segment A segment.
     * @param {CodePathSegment} prevSegment A previous segment to mark.
     * @returns {void}
     */
    static markPrevSegmentAsLooped(segment: CodePathSegment, prevSegment: CodePathSegment): void;
    /**
     * Creates a new array based on an array of segments. If any segment in the
     * array is unused, then it is replaced by all of its previous segments.
     * All used segments are returned as-is without replacement.
     * @param {CodePathSegment[]} segments The array of segments to flatten.
     * @returns {CodePathSegment[]} The flattened array.
     */
    static flattenUnusedSegments(segments: CodePathSegment[]): CodePathSegment[];
    /**
     * Creates a new instance.
     * @param {string} id An identifier.
     * @param {CodePathSegment[]} allPrevSegments An array of the previous segments.
     *   This array includes unreachable segments.
     * @param {boolean} reachable A flag which shows this is reachable.
     */
    constructor(id: string, allPrevSegments: CodePathSegment[], reachable: boolean);
    /**
     * The identifier of this code path.
     * Rules use it to store additional information of each rule.
     * @type {string}
     */
    id: string;
    /**
     * An array of the next reachable segments.
     * @type {CodePathSegment[]}
     */
    nextSegments: CodePathSegment[];
    /**
     * An array of the previous reachable segments.
     * @type {CodePathSegment[]}
     */
    prevSegments: CodePathSegment[];
    /**
     * An array of all next segments including reachable and unreachable.
     * @type {CodePathSegment[]}
     */
    allNextSegments: CodePathSegment[];
    /**
     * An array of all previous segments including reachable and unreachable.
     * @type {CodePathSegment[]}
     */
    allPrevSegments: CodePathSegment[];
    /**
     * A flag which shows this is reachable.
     * @type {boolean}
     */
    reachable: boolean;
    /**
     * Checks a given previous segment is coming from the end of a loop.
     * @param {CodePathSegment} segment A previous segment to check.
     * @returns {boolean} `true` if the segment is coming from the end of a loop.
     */
    isLoopedPrevSegment(segment: CodePathSegment): boolean;
}
