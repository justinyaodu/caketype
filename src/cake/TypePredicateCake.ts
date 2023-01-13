import {
  Cake,
  CakeError,
  CakeErrorDispatchFormatContext,
  StringTree,
} from "./index-internal";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function is_any(value: unknown): value is any {
  return true;
}

function is_bigint(value: unknown): value is bigint {
  return typeof value === "bigint";
}

function is_boolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function is_never(value: unknown): value is never {
  return false;
}

function is_number(value: unknown): value is number {
  return typeof value === "number";
}

function is_string(value: unknown): value is string {
  return typeof value === "string";
}

function is_symbol(value: unknown): value is symbol {
  return typeof value === "symbol";
}

function is_unknown(value: unknown): value is unknown {
  return true;
}

const any = new TypePredicateCake("any", is_any);
const boolean = new TypePredicateCake("boolean", is_boolean);
const bigint = new TypePredicateCake("bigint", is_bigint);
const never = new TypePredicateCake("never", is_never);
const number = new TypePredicateCake("number", is_number);
const string = new TypePredicateCake("string", is_string);
const symbol = new TypePredicateCake("symbol", is_symbol);
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
