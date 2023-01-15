import {
  is_any,
  is_boolean,
  is_bigint,
  is_never,
  is_number,
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
} from "./index-internal";

/**
 * @public
 */
class TypeGuardCake<T> extends Cake<T> {
  constructor(
    readonly name: string,
    readonly guard: (value: unknown) => value is T
  ) {
    super();
  }

  dispatchCheck(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeDispatchCheckContext
  ): CakeError | null {
    if (this.guard(value)) {
      return null;
    }
    return new TypeGuardFailedCakeError(this, value);
  }

  dispatchStringify(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeDispatchStringifyContext
  ): string {
    return this.name;
  }
}

/**
 * @public
 */
class TypeGuardFailedCakeError extends CakeError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(readonly cake: TypeGuardCake<any>, readonly value: unknown) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { stringifyCake } = context;
    return `Value does not satisfy type '${stringifyCake(
      this.cake
    )}': type guard failed.`;
  }
}

/**
 * @public
 */
const any = new TypeGuardCake("any", is_any);

/**
 * @public
 */
const boolean = new TypeGuardCake("boolean", is_boolean);

/**
 * @public
 */
const bigint = new TypeGuardCake("bigint", is_bigint);

/**
 * @public
 */
const never = new TypeGuardCake("never", is_never);

/**
 * @public
 */
const number = new TypeGuardCake("number", is_number);

/**
 * @public
 */
const string = new TypeGuardCake("string", is_string);

/**
 * @public
 */
const symbol = new TypeGuardCake("symbol", is_symbol);

/**
 * @public
 */
const unknown = new TypeGuardCake("unknown", is_unknown);

export {
  TypeGuardCake,
  TypeGuardFailedCakeError,
  any,
  boolean,
  bigint,
  never,
  number,
  string,
  symbol,
  unknown,
};
