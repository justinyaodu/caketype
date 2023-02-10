import { Result } from "../index-internal";

import type { CakeError } from "./index-internal";

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
abstract class Refinement<in I = any, out O extends I = I>
{
  check(value: I): Result<O, CakeError> {
    const error = this.dispatchCheck(value);
    if (error === null) {
      return Result.ok(value as O);
    }
    return Result.err(error);
  }

  abstract dispatchCheck(value: I): CakeError | null;

  abstract toString(): string;
}

export { Refinement };
