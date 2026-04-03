/**
 * @fileoverview Utility to convert gitignore patterns to minimatch.
 * @author Nicholas C. Zakas
 */
/**
 * Converts a gitignore pattern to a minimatch pattern.
 * @param {string} pattern The gitignore pattern to convert.
 * @returns {string} A minimatch pattern equivalent to `pattern`.
 */
export function gitignoreToMinimatch(pattern: string): string;
