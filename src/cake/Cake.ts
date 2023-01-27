import type { Result } from "../index-internal";

import {
  CakeStringifier,
  Checker,
  CheckOptions,
  Untagged,
} from "./index-internal";
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
  readonly getOption: <K extends keyof CheckOptions>(
    self: Cake,
    key: K
  ) => CheckOptions[K];
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
interface CakeArgs {
  readonly name?: string | null;
  readonly options?: Partial<CheckOptions>;
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
abstract class Cake<in out T = any> extends Untagged implements CakeArgs {
  readonly name: string | null;
  readonly options: Partial<CheckOptions>;

  constructor(args: CakeArgs) {
    super();
    this.name = args.name === undefined ? null : args.name;
    this.options = args.options === undefined ? {} : args.options;
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
   * The default type-checking behavior is stricter than TypeScript, making it
   * suitable for validating parsed JSON. For example, excess object properties
   * are not allowed.
   *
   * @see {@link Cake.asShape} for more lenient type-checking.
   * @see {@link Cake.check} to return the error instead of throwing it.
   */
  as(value: unknown): T {
    const result = this.check(value);
    if (result.ok) {
      return result.value;
    }
    return result.error.throw();
  }

  /**
   * Like {@link Cake.as}, but use lenient type-checking at runtime to match
   * TypeScript's static type-checking more closely.
   *
   * @example Excess object properties are allowed with lenient type-checking,
   * but not allowed with strict type-checking:
   *
   * ```ts
   * const Person = bake({ name: string } as const);
   * const alice = { name: "Alice", extra: "oops" };
   *
   * Person.asShape(alice); // { name: "Alice", extra: "oops" }
   *
   * Person.as(alice);
   * // TypeError: Value does not satisfy type '{name: string}': object properties are invalid.
   * //   Property "extra": Property is not declared in type and excess properties are not allowed.
   * ```
   */
  asShape(value: unknown): T {
    const result = this.checkShape(value);
    if (result.ok) {
      return result.value;
    }
    return result.error.throw();
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
   * The default type-checking behavior is stricter than TypeScript, making it
   * suitable for validating parsed JSON. For example, excess object properties
   * are not allowed.
   *
   * @see {@link Cake.checkShape} for more lenient type-checking.
   * @see {@link Cake.as} to throw an error if the type is not satisfied.
   */
  check(value: unknown): Result<T, CakeError> {
    return new Checker().check(this, value);
  }

  /**
   * Like {@link Cake.check}, but use lenient type-checking at runtime to match
   * TypeScript's static type-checking more closely.
   *
   * @example Excess object properties are allowed with lenient type-checking,
   * but not allowed with strict type-checking:
   *
   * ```ts
   * const Person = bake({ name: string } as const);
   * const alice = { name: "Alice", extra: "oops" };
   *
   * Person.checkShape(alice); // Ok(alice)
   * Person.check(alice); // Err(<CakeError>)
   * ```
   */
  checkShape(value: unknown): Result<T, CakeError> {
    return new Checker(CheckOptions.LENIENT).check(this, value);
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
   *
   * The default type-checking behavior is stricter than TypeScript, making it
   * suitable for validating parsed JSON. For example, excess object properties
   * are not allowed.
   *
   * @see {@link Cake.isShape} for more lenient type-checking.
   */
  is(value: unknown): value is T {
    return this.check(value).ok;
  }

  /**
   * Like {@link Cake.is}, but use lenient type-checking at runtime to match
   * TypeScript's static type-checking more closely.
   *
   * @example Excess object properties are allowed with lenient type-checking,
   * but not allowed with strict type-checking:
   *
   * ```ts
   * const Person = bake({ name: string } as const);
   * const alice = { name: "Alice", extra: "oops" };
   *
   * Person.isShape(alice); // true
   * Person.is(alice); // false
   * ```
   */
  isShape(value: unknown): value is T {
    return this.checkShape(value).ok;
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

  abstract dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null;

  abstract dispatchStringify(context: CakeDispatchStringifyContext): string;

  abstract withName(name: string | null): Cake<T>;

  /**
   * Used for type inference to ensure that Cakes are invariant on T.
   *
   * This property is never used at runtime.
   *
   * @internal
   */
  readonly _ENSURE_INVARIANT?: (value: T) => T;
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
  CakeArgs,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  Infer,
};
