import { deepGetResult, deepSet } from "../index-internal";

import {
  Cake,
  CakeDispatchCheckContext,
  CakeError,
  CakeErrorDispatchFormatContext,
  StringTree,
} from "./index-internal";

class Checker {
  protected readonly cache: Map<Cake, Map<unknown, CakeError | null | undefined>>;
  protected readonly context: CakeDispatchCheckContext;

  constructor() {
    this.cache = new Map();
    this.context = {
      recurse: (cake, value) => this.checkVisit(cake, value),
    };
  }

  check(cake: Cake, value: unknown): CakeError | null {
    return this.checkVisit(cake, value);
  }

  protected checkVisit(cake: Cake, value: unknown): CakeError | null {
    const result = deepGetResult(this.cache, cake, value);
    if (result.ok) {
      if (result.value === undefined) {
        return new CircularReferenceCakeError(cake, value);
      } else {
        return result.value;
      }
    } else {
      deepSet(this.cache, cake, value, undefined);
      const error = this.checkDispatch(cake, value);
      deepSet(this.cache, cake, value, error);
      return error;
    }
  }

  protected checkDispatch(cake: Cake, value: unknown): CakeError | null {
    return cake.dispatchCheck(value, this.context);
  }
}

class CircularReferenceCakeError extends CakeError {
  constructor(readonly cake: Cake, readonly value: unknown) {
    super();
  }

  dispatchFormat({
    stringifyCake,
  }: CakeErrorDispatchFormatContext): StringTree {
    return `Could not determine if value satisfies type '${stringifyCake(
      this.cake
    )}': value contains a circular reference.`;
  }
}

export { Checker, CircularReferenceCakeError };
