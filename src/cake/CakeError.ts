import { CakeErrorStringifier } from "./index-internal";
import type { Cake, StringTree } from "./index-internal";

/**
 * @public
 */
interface CakeErrorDispatchFormatContext {
  readonly recurse: (error: CakeError) => StringTree;
  readonly stringifyCake: (cake: Cake) => string;
}

/**
 * Represent the reason why a value did not satisfy the type represented by a
 * {@link Cake}.
 *
 * @public
 */
abstract class CakeError {
  abstract dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree;

  /**
   * Throw a TypeError created from this CakeError.
   *
   * @example
   * ```ts
   * error.throw();
   * // TypeError: Value does not satisfy type '{name: string}': object properties are invalid.
   * //   Property "name": Required property is missing.
   * ```
   */
  throw(): never {
    throw new TypeError(this.toString());
  }

  /**
   * Return a human-readable string representation of this CakeError.
   *
   * @example
   * ```ts
   * console.log(error.toString());
   * // Value does not satisfy type '{name: string}': object properties are invalid.
   * //   Property "name": Required property is missing.
   * ```
   */
  toString(): string {
    return new CakeErrorStringifier().stringify(this);
  }
}

export { CakeError, CakeErrorDispatchFormatContext };
