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

export { TypePredicateCake, TypePredicateFailedCakeError };
