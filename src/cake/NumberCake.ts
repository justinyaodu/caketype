import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  CakeErrorDispatchFormatContext,
  StringTree,
  WrongTypeCakeError,
} from "./index-internal";

/**
 * See {@link number}.
 *
 * @public
 */
class NumberCake extends Cake<number> {
  dispatchCheck(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeDispatchCheckContext
  ): CakeError | null {
    if (typeof value !== "number") {
      return new WrongTypeCakeError(this, value);
    }
    if (Number.isNaN(value)) {
      return new IsNaNCakeError();
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchStringify(context: CakeDispatchStringifyContext): string {
    return "number";
  }

  withName(name: string | null): NumberCake {
    return new NumberCake({ ...this, name });
  }
}

class IsNaNCakeError extends CakeError {
  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    return "Value is NaN.";
  }
}

/**
 * A {@link Cake} representing the `number` type.
 *
 * @example
 * ```ts
 * number.is(5); // true
 * number.is("5"); // false
 * ```
 *
 * @example Although `typeof NaN === "number"`, this Cake does not accept `NaN`:
 * ```ts
 * number.is(NaN); // false
 * number.as(NaN); // TypeError: Value is NaN.
 * ```
 *
 * @public
 */
const number = new NumberCake({});

export { NumberCake, number };
