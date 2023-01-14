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
  StringTree,
} from "./index-internal";

/**
 * @public
 */
class TypePredicateCake<T> extends Cake<T> {
  constructor(
    readonly name: string,
    readonly predicate: (value: unknown) => value is T
  ) {
    super();
  }

  dispatchCheck(value: unknown): CakeError | null {
    if (this.predicate(value)) {
      return null;
    }
    return new TypePredicateFailedCakeError(this, value);
  }

  dispatchStringify(): string {
    return this.name;
  }
}

/**
 * @public
 */
class TypePredicateFailedCakeError extends CakeError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(readonly cake: TypePredicateCake<any>, readonly value: unknown) {
    super();
  }

  dispatchFormat({
    stringifyCake,
  }: CakeErrorDispatchFormatContext): StringTree {
    return `Value does not satisfy type '${stringifyCake(
      this.cake
    )}': type predicate failed.`;
  }
}

/**
 * @public
 */
const any = new TypePredicateCake("any", is_any);

/**
 * @public
 */
const boolean = new TypePredicateCake("boolean", is_boolean);

/**
 * @public
 */
const bigint = new TypePredicateCake("bigint", is_bigint);

/**
 * @public
 */
const never = new TypePredicateCake("never", is_never);

/**
 * @public
 */
const number = new TypePredicateCake("number", is_number);

/**
 * @public
 */
const string = new TypePredicateCake("string", is_string);

/**
 * @public
 */
const symbol = new TypePredicateCake("symbol", is_symbol);

/**
 * @public
 */
const unknown = new TypePredicateCake("unknown", is_unknown);

export {
  TypePredicateCake,
  TypePredicateFailedCakeError,
  any,
  boolean,
  bigint,
  never,
  number,
  string,
  symbol,
  unknown,
};
