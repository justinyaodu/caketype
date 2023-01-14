import type { Result } from "../index-internal";

import { CakeStringifier, Checker, Untagged } from "./index-internal";
import type { CakeError } from "./index-internal";

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
    return new Checker().check(this, value);
  }

  abstract dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null;

  abstract dispatchStringify(context: CakeDispatchStringifyContext): string;

  override toString(): string {
    return new CakeStringifier().stringify(this);
  }
}

type Infer<C extends Cake> = C extends Cake<infer T> ? T : never;

export { Cake, CakeDispatchCheckContext, CakeDispatchStringifyContext, Infer };
