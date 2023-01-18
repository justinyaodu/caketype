import type { Result } from "../index-internal";

import { CakeStringifier, Checker, Untagged } from "./index-internal";
import type {
  CakeError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bake,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  number,
} from "./index-internal";

/**
 * @public
 */
interface CakeDispatchCheckContext {
  readonly recurse: (cake: Cake, value: unknown) => CakeError | null;
}

/**
 * @public
 */
interface CakeDispatchStringifyContext {
  readonly recurse: (cake: Cake) => string;
}

/**
 * @public
 */
interface CakeRecipe {
  readonly name?: string | null;
}

/**
 * Represent a TypeScript type at runtime.
 *
 * @typeParam T - The TypeScript type represented by this Cake.
 *
 * @see {@link bake} to create a Cake.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
abstract class Cake<in out T = any> extends Untagged implements CakeRecipe {
  readonly name: string | null;

  constructor(recipe: CakeRecipe) {
    super();
    this.name = recipe.name === undefined ? null : recipe.name;
  }

  /**
   * Return the provided value if it satisfies the type represented by this
   * Cake, and throw a TypeError otherwise.
   *
   * @example Using the built-in {@link number} Cake:
   *
   * ```ts
   * number.as(3); // 3
   *
   * number.as("oops");
   * // TypeError: Value does not satisfy type 'number': type guard failed.
   * ```
   *
   * @see {@link Cake.check} to return the error instead of throwing it.
   */
  as(value: unknown): T {
    const result = this.check(value);
    if (result.ok) {
      return result.value;
    }
    throw new TypeError(result.error.toString());
  }

  /**
   * Return a {@link Result} with the provided value if it satisfies the type
   * represented by this Cake, or a {@link CakeError} otherwise.
   *
   * @example Using the built-in {@link number} Cake:
   *
   * ```ts
   * function square(input: unknown) {
   *   const result = number.check(input);
   *   if (result.ok) {
   *     // result.value is a number
   *     return result.value ** 2;
   *   } else {
   *     // result.error is a CakeError
   *     console.error(result.error);
   *   }
   * }
   *
   * square(3); // 9
   *
   * square("oops");
   * // Value does not satisfy type 'number': type guard failed.
   * ```
   *
   * @example {@link Result.valueOr} can be used to return a default value when
   * the provided value is invalid:
   *
   * ```ts
   * number.check(3).valueOr(0); // 3
   * number.check("oops").valueOr(0); // 0
   * ```
   *
   * @example {@link Result.errorOr} can be used to get the {@link CakeError}
   * directly, or a default value if no error occurred:
   *
   * ```ts
   * number.check(3).errorOr(null); // null
   * number.check("oops").errorOr(null); // <CakeError>
   * ```
   *
   * @see {@link Cake.as} to throw an error if the type is not satisfied.
   */
  check(value: unknown): Result<T, CakeError> {
    return new Checker().check(this, value);
  }

  /**
   * Return whether a value satisfies the type represented by this Cake.
   *
   * @example Using the built-in {@link number} Cake:
   *
   * ```ts
   * number.is(3); // true
   * number.is("oops"); // false
   * ```
   *
   * @example This can be used as a
   * [type guard](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
   * for control flow narrowing:
   *
   * ```ts
   * const value: unknown = 7;
   * if (number.is(value)) {
   *   // here, value has type 'number'
   * }
   * ```
   */
  is(value: unknown): value is T {
    return this.check(value).ok;
  }

  /**
   * Return a human-readable string representation of the type represented by
   * this Cake.
   *
   * @example
   * ```ts
   * const Person = bake({
   *   name: string,
   *   age: optional(number),
   * } as const);
   *
   * Person.toString();
   * // {name: string, age?: (number) | undefined}
   * ```
   *
   * The string representation is designed to be unambiguous and simple to
   * generate, so it may contain redundant parentheses.
   *
   * The format of the return value may change between versions.
   */
  override toString(): string {
    return new CakeStringifier().stringify(this);
  }

  /**
   * @public
   */
  abstract dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null;

  /**
   * @public
   */
  abstract dispatchStringify(context: CakeDispatchStringifyContext): string;

  abstract withName(name: string | null): Cake<T>;
}

/**
 * Get the TypeScript type represented by a {@link Cake}.
 *
 * @example
 * ```ts
 * const Person = bake({
 *   name: string,
 *   age: optional(number),
 * } as const);
 *
 * type Person = Infer<typeof Person>;
 * // { name: string, age?: number | undefined }
 * ```
 *
 * @public
 */
type Infer<C extends Cake> = C extends Cake<infer T> ? T : never;

export {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeRecipe,
  Infer,
};
