import {
  is_any,
  is_boolean,
  is_bigint,
  is_never,
  is_string,
  is_symbol,
  is_unknown,
} from "../index-internal";

import {
  Cake,
  CakeError,
  CakeErrorDispatchFormatContext,
  CakeDispatchStringifyContext,
  StringTree,
  CakeDispatchCheckContext,
  CakeArgs,
} from "./index-internal";

/**
 * @public
 */
interface TypeGuardCakeArgs<T> extends CakeArgs {
  readonly guard: (value: unknown) => value is T;
}

/**
 * @public
 */
class TypeGuardCake<T> extends Cake<T> implements TypeGuardCakeArgs<T> {
  readonly guard: (value: unknown) => value is T;

  constructor(args: TypeGuardCakeArgs<T>) {
    super(args);
    this.guard = args.guard;
  }

  dispatchCheck(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeDispatchCheckContext
  ): CakeError | null {
    if (this.guard(value)) {
      return null;
    }
    return new WrongTypeCakeError(this, value);
  }

  dispatchStringify(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeDispatchStringifyContext
  ): string {
    return `(type guard ${this.guard.name})`;
  }

  withName(name: string | null): TypeGuardCake<T> {
    return new TypeGuardCake({ ...this, name });
  }
}

/**
 * @public
 */
class WrongTypeCakeError extends CakeError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(readonly cake: Cake<any>, readonly value: unknown) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { stringifyCake } = context;
    return `Value does not satisfy type '${stringifyCake(this.cake)}'.`;
  }
}

/**
 * @public
 */
function typeGuard<T>(
  name: string,
  guard: (value: unknown) => value is T
): TypeGuardCake<T> {
  return new TypeGuardCake({ name, guard });
}

/**
 * A {@link Cake} representing the `any` type. Every value satisfies this type.
 *
 * @example
 * ```ts
 * any.is("hello"); // true
 * any.is(null); // true
 * ```
 *
 * @see {@link unknown} to get the same runtime behavior, but an inferred type
 * of `unknown` instead of `any`.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const any: Cake<any> = typeGuard("any", is_any);

/**
 * A {@link Cake} representing the `boolean` type.
 *
 * @example
 * ```ts
 * boolean.is(true); // true
 * boolean.is(1); // false
 * ```
 *
 * @public
 */
const boolean: Cake<boolean> = typeGuard("boolean", is_boolean);

/**
 * A {@link Cake} representing the `bigint` type.
 *
 * @example
 * ```ts
 * bigint.is(BigInt(5)); // true
 * bigint.is(5); // false
 * ```
 *
 * @public
 */
const bigint: Cake<bigint> = typeGuard("bigint", is_bigint);

/**
 * A {@link Cake} representing the `never` type. No value satisfies this type.
 *
 * @example
 * ```ts
 * never.is("hello"); // false
 * never.is(undefined); // false
 * ```
 *
 * @public
 */
const never: Cake<never> = typeGuard("never", is_never);

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
const string: Cake<string> = typeGuard("string", is_string);

/**
 * A {@link Cake} representing the `symbol` type.
 *
 * @example
 * ```ts
 * symbol.is(Symbol.iterator); // true
 * symbol.is(Symbol("hi")); // true
 * ```
 *
 * @public
 */
const symbol: Cake<symbol> = typeGuard("symbol", is_symbol);

/**
 * A {@link Cake} representing the `unknown` type. Every value satisfies this
 * type.
 *
 * @example
 * ```ts
 * unknown.is("hello"); // true
 * unknown.is(null); // true
 * ```
 *
 * @see {@link any} to get the same runtime behavior, but an inferred type
 * of `any` instead of `unknown`.
 *
 * @public
 */
const unknown: Cake<unknown> = typeGuard("unknown", is_unknown);

export {
  TypeGuardCake,
  TypeGuardCakeArgs,
  WrongTypeCakeError,
  typeGuard,
  any,
  boolean,
  bigint,
  never,
  string,
  symbol,
  unknown,
};
