/**
 * Return whether two values are equal, using the
 * [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
 * equality algorithm.
 *
 * This has almost the same behavior as `===`, except it considers `NaN` equal
 * to `NaN`.
 *
 * @example
 * ```ts
 * sameValueZero(3, 3); // true
 * sameValueZero(0, false); // false
 * sameValueZero(0, -0); // true
 * sameValueZero(NaN, NaN); // true
 * ```
 *
 * @public
 */
function sameValueZero(a: unknown, b: unknown): boolean {
  return a === b || (Number.isNaN(a) && Number.isNaN(b));
}

export { sameValueZero };
