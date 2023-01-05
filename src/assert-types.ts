/**
 * Inspect and assert relationships between types. For example, you can
 * assert that one type extends another, or that two types are equivalent, and
 * produce type errors if these assertions fail.
 *
 * This can be used to test complex conditional types and type inference.
 */

/**
 * Assert that the type argument is always true, or cause a type error
 * otherwise.
 *
 * Typically used with {@link Equivalent}, or another generic type that returns
 * a boolean.
 *
 * @example
 * ```ts
 * type _pass = Assert<Equivalent<string["length"], number>>;
 * // OK: Equivalent<string["length"], number> is true
 *
 * type _fail = Assert<Equivalent<string, number>>;
 * // Type error: Equivalent<string, number> is false
 * ```
 *
 * @see {@link AssertExtends} to get more specific error messages if you are
 * asserting that one type extends another.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Assert<T extends true> = never;

/**
 * Assert that T extends U.
 *
 * @example
 * ```ts
 * type _pass = AssertExtends<3, number>;
 * // OK: 3 extends number
 *
 * type _fail = AssertExtends<number, 3>;
 * // Type error: 'number' does not satisfy '3'
 * ```
 *
 * This behaves like {@link Assert} combined with {@link Extends}, but it uses
 * generic constraints so you can get more specific error messages from the
 * TypeScript compiler.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertExtends<T extends U, U> = never;

/**
 * If T and U extend each other, return true. Otherwise, return false.
 *
 * @example
 * ```ts
 * type _true = Equivalent<string["length"], number>; // true
 *
 * type _false = Equivalent<3, number>;
 * // false: 3 extends number, but number does not extend 3
 * ```
 *
 * @public
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
 * type _ = Assert<Not<Extends<number, 3>>>;
 * // OK: number does not extend 3
 * ```
 *
 * @see {@link AssertExtends} to get more specific error messages if you are
 * asserting that one type extends another.
 *
 * @public
 */
type Extends<T, U> = [T] extends [U] ? true : false;

/**
 * If T is true, return U. Otherwise, return V.
 *
 * @example
 * ```ts
 * type _apple = If<true, "apple", "banana">; // "apple"
 *
 * type _either = If<true | false, "apple", "banana">;
 * // "apple" | "banana"
 * ```
 *
 * @public
 */
type If<T extends boolean, U, V> = T extends true ? U : V;

/**
 * Return the boolean negation of the type argument.
 *
 * @example
 * ```ts
 * type _false = Not<true>; // false
 *
 * type _boolean = Not<boolean>;
 * // negation of true | false is false | true
 * ```
 *
 * @public
 */
type Not<T extends boolean> = T extends true ? false : true;

export { Assert, AssertExtends, Equivalent, Extends, If, Not };
