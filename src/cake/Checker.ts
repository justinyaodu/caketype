import {
  deepGetResult,
  deepSet,
  lookup,
  merge,
  Result,
} from "../index-internal";

import {
  Cake,
  CakeDispatchCheckContext,
  CakeError,
  CakeErrorDispatchFormatContext,
  CheckOptions,
  StringTree,
} from "./index-internal";

/**
 * @internal
 */
class Checker {
  protected readonly options: CheckOptions;
  protected readonly cache: Map<
    Cake,
    Map<unknown, CakeError | null | undefined>
  >;
  protected readonly context: CakeDispatchCheckContext;

  constructor(options?: CheckOptions) {
    this.options = merge(CheckOptions.STRICT, options || {});
    this.cache = new Map();
    this.context = {
      recurse: (cake, value) => this.checkVisit(cake, value),
      getOption: (self, key) => this.getOption(self, key),
    };
  }

  check<T>(cake: Cake<T>, value: unknown): Result<T, CakeError> {
    const error = this.checkVisit(cake, value);
    return error === null ? Result.ok(value as T) : Result.err(error);
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

  protected getOption<K extends keyof CheckOptions>(
    self: Cake,
    key: K
  ): CheckOptions[K] {
    return lookup(key, self.options, this.options);
  }
}

/**
 * @internal
 */
class CircularReferenceCakeError extends CakeError {
  constructor(readonly cake: Cake, readonly value: unknown) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { stringifyCake } = context;
    return `Could not determine if value satisfies type '${stringifyCake(
      this.cake
    )}': value contains a circular reference.`;
  }
}

export { Checker, CircularReferenceCakeError };
