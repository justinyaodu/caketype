import { Result } from "../index-internal";

import {
  CakeError,
  CakeStringifier,
  Checker,
  Untagged,
} from "./index-internal";

interface CakeDispatchCheckContext {
  readonly recurse: (cake: Cake, value: unknown) => CakeError | null;
}

interface CakeDispatchStringifyContext {
  readonly recurse: (cake: Cake) => string;
}

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
abstract class Cake<in out T = any> extends Untagged {
  as(value: unknown): T {
    const result = this.check(value);
    if (result.ok) {
      return result.value;
    }
    throw new TypeError(result.error.toString());
  }

  is(value: unknown): value is T {
    return this.check(value).ok;
  }

  check(value: unknown): Result<T, CakeError> {
    const error = new Checker().check(this, value);
    return error === null ? Result.ok(value as T) : Result.err(error);
  }

  abstract dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null;

  abstract dispatchStringify(context: CakeDispatchStringifyContext): string;

  toString(): string {
    return new CakeStringifier().stringify(this);
  }
}

export { Cake, CakeDispatchCheckContext, CakeDispatchStringifyContext };
