/**
 * A JavaScript
 * [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive):
 * bigint, boolean, number, string, symbol, null, or undefined.
 * @public
 */
type Primitive = bigint | boolean | number | string | symbol | null | undefined;

/**
 * Return whether a value is a {@link Primitive}.
 *
 * @example
 * ```ts
 * isPrimitive(5); // true
 * isPrimitive([]); // false
 * ```
 *
 * @public
 */
function isPrimitive(value: unknown): value is Primitive {
  switch (typeof value) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "symbol":
    case "undefined":
      return true;
    case "object":
      return value === null;
    case "function":
      return false;
  }
}

/**
 * Return a string representation of a {@link Primitive} that resembles how it
 * would be written as a literal in source code.
 *
 * @example
 * ```ts
 * console.log(stringifyPrimitive(BigInt(-27))); // -27n
 * console.log(stringifyPrimitive("hi\nbye")); // "hi\nbye"
 * // Symbols are unique, so they cannot be recreated
 * // by evaluating their string representation:
 * console.log(stringifyPrimitive(Symbol("apple"))); // Symbol(apple)
 * ```
 *
 * @public
 */
function stringifyPrimitive(value: Primitive): string {
  switch (typeof value) {
    case "bigint":
      return `${value}n`;
    case "string":
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

export { Primitive, isPrimitive, stringifyPrimitive };
