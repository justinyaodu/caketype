/**
 * The type of a class (something that can be called with `new` to construct
 * an instance).
 *
 * @typeParam T - Type of the class instances.
 * @typeParam A - Type of the constructor arguments.
 *
 * @example
 * ```ts
 * // Any class.
 * const a: Class[] = [Date, Array, RegExp];
 *
 * // A class whose instance type is Date.
 * const b: Class<Date> = Date;
 *
 * // A class whose instance type is Date, and whose
 * // constructor can be called with one number argument.
 * const c: Class<Date, [number]> = Date;
 * ```
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Class<T = any, A extends unknown[] = any> extends Function {
  new (...args: A): T;
}

export { Class };
