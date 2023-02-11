import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  StringConstraints,
  StringConstraintsRefinement,
  StringRefinementCake,
  Refinement,
  WrongTypeCakeError,
} from "./index-internal";
import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  number,
} from "./index-internal";

/**
 * See {@link string}.
 *
 * @public
 */
class StringCake extends Cake<string> {
  /**
   * Only allow strings that satisfy the specified constraints.
   *
   * @example
   *
   * ```ts
   * const NonEmptyString = string.satisfying({ length: { min: 1 } });
   *
   * NonEmptyString.as("hello"); // "hello"
   *
   * NonEmptyString.as("");
   * // TypeError: String length is invalid: Number is less than the minimum of 1.
   * ```
   *
   * Here, the length constraint is an object accepted by
   * {@link number.satisfying}; it can also be a number indicating the exact
   * length, or a Cake.
   *
   * @example Strings matching a regular expression (use `^` and `$` to match
   * the entire string):
   *
   * ```ts
   * const HexString = string.satisfying({ regex: /^[0-9a-f]+$/ });
   *
   * HexString.as("123abc"); // "123abc"
   *
   * HexString.as("oops");
   * // TypeError: String does not match regex /^[0-9a-f]+$/.
   * ```
   */
  satisfying(
    constraints: StringConstraints
  ): StringRefinementCake<string, string, this, StringConstraintsRefinement> {
    return this.refined(new StringConstraintsRefinement({ constraints }));
  }

  override refined<O extends string, R extends Refinement<string, O>>(
    refinement: R
  ): StringRefinementCake<string, O, this, R> {
    return new StringRefinementCake({ base: this, refinement });
  }

  dispatchCheck(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeDispatchCheckContext
  ): CakeError | null {
    if (typeof value !== "string") {
      return new WrongTypeCakeError(this, value);
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchStringify(context: CakeDispatchStringifyContext): string {
    return "string";
  }

  withName(name: string | null): StringCake {
    return new StringCake({ ...this, name });
  }
}

/**
 * A {@link Cake} representing the `string` type.
 *
 * @example
 * ```ts
 * string.is("hello"); // true
 * string.is(""); // true
 * ```
 *
 * @public
 */
const string = new StringCake({});

export { StringCake, string };
