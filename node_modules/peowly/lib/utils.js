/**
 * @template {unknown[]|(readonly unknown[])} T
 * @param {T} input
 * @returns {Exclude<T[number], undefined>[]}
 */
export function filter (input) {
  /** @type {Exclude<T[number], undefined>[]} */
  const result = [];

  for (const item of input) {
    if (item !== undefined) {
      result.push(/** @type {Exclude<T[number], undefined>} */ (item));
    }
  }

  return result;
}

// TODO [engine:node@>=21.0.0]: You can use the built in Object.groupBy() instead
/**
 * Ponyfill for Object.groupBy
 *
 * @template T
 * @template {string | number | symbol} K
 * @param {Iterable<T>} iterable
 * @param {function(T, number): K} callback
 * @returns {Partial<Record<K, T[]>>}
 */
export function groupBy (iterable, callback) {
  /** @type {Partial<Record<K, T[]>>} */
  const obj = {};
  let i = 0;
  for (const value of iterable) {
    const key = callback(value, i++);
    const existingGroup = obj[key];
    if (existingGroup) {
      existingGroup.push(value);
    } else {
      obj[key] = [value];
    }
  }

  return obj;
}
