/**
 * Assert that the type argument is always true. Often used with
 * {@link Equivalent}.
 *
 * @example
 * ```ts
 * type _pass = Assert<Equivalent<string["length"], number>>; // OK
 * type _fail = Assert<Equivalent<string, number>>; // Type error!
 * ```
 *
 * @see {@link AssertExtends} to get more specific error messages if you are
 * asserting that one type extends another.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Assert<T extends true> = never;

/**
 * Assert that T extends U.
 *
 * @example
 * ```ts
 * type _pass = AssertExtends<3, number>; // OK: 3 extends number
 * type _fail = AssertExtends<number, 3>; // 'number' does not satisfy '3'
 * ```
 *
 * This behaves like {@link Assert} combined with {@link Extends}, but it uses
 * generic constraints so you can get more specific error messages from the
 * TypeScript compiler.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertExtends<T extends U, U> = never;

/**
 * If T and U extend each other, return true. Otherwise, return false.
 *
 * @example
 * ```ts
 * type _true = Equivalent<string["length"], number>; // true
 * type _false = Equivalent<3, number>; // false: 3 extends number, but number does not extend 3
 * ```
 */
type Equivalent<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;

/**
 * If T extends U, return true. Otherwise, return false.
 *
 * @example
 * ```ts
 * type _ = Assert<Not<Extends<number, 3>>>; // OK: number does not extend 3
 * ```
 *
 * @see {@link AssertExtends} to get more specific error messages if you are
 * asserting that one type extends another.
 */
type Extends<T, U> = [T] extends [U] ? true : false;

/**
 * If T is true, return U. Otherwise, return V.
 *
 * @example
 * ```ts
 * type _ = If<true, "then", "else">; // "then"
 * ```
 */
type If<T extends boolean, U, V> = T extends true ? U : V;

/**
 * Return the boolean negation of the type argument.
 *
 * @example
 * ```ts
 * type _false = Not<true>; // false
 * type _boolean = Not<boolean>; // negation of true | false is true | false
 * ```
 */
type Not<T extends boolean> = T extends true ? false : true;

export { Assert, AssertExtends, Equivalent, Extends, If, Not };
