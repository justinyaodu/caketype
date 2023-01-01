/**
 * A JavaScript
 * [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).
 */
type Primitive = bigint | boolean | number | string | symbol | null | undefined;

/**
 * Return whether a value is a {@link Primitive}.
 */
function is(value: unknown): value is Primitive {
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
 * Return a string representation of a {@link Primitive} value that resembles
 * how it would be written as a literal in source code.
 *
 * @example
 * ```ts
 * console.log(Primitive.stringify(BigInt(-27))); // -27n
 * console.log(Primitive.stringify("hi\nbye")); // "hi\nbye"
 * // Symbols are unique, so they cannot be recreated
 * // by evaluating their string representation:
 * console.log(Primitive.stringify(Symbol("apple"))); // Symbol(apple)
 * ```
 */
function stringify(value: Primitive): string {
  switch (typeof value) {
    case "bigint":
      return `${value}n`;
    case "string":
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

const Primitive = {
  is,
  stringify,
} as const;

export { Primitive };
