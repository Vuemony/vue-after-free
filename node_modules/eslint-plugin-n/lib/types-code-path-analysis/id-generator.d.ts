export = IdGenerator;
/**
 * A generator for unique ids.
 */
declare class IdGenerator {
    /**
     * @param {string} prefix Optional. A prefix of generated ids.
     */
    constructor(prefix: string);
    prefix: string;
    n: number;
    /**
     * Generates id.
     * @returns {string} A generated id.
     */
    next(): string;
}
