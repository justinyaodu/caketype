import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  CakeErrorDispatchFormatContext,
  NumberConstraints,
  NumberConstraintsRefinement,
  NumberRefinementCake,
  Refinement,
  StringTree,
  WrongTypeCakeError,
} from "./index-internal";

/**
 * See {@link number}.
 *
 * @public
 */
class NumberCake extends Cake<number> {
  /**
   * Only allow numbers that satisfy the specified constraints.
   *
   * @example
   * ```ts
   * const Percentage = number.satisfying({ min: 0, max: 100 });
   *
   * Percentage.as(20.3); // 20.3
   *
   * Percentage.as(-1);
   * // TypeError: Number is less than the minimum of 0.
   *
   * Percentage.as(101);
   * // TypeError: Number is greater than the maximum of 100.
   * ```
   *
   * @example The `min` and `max` are inclusive:
   *
   * ```ts
   * Percentage.as(0); // 0
   * Percentage.as(100); // 100
   * ```
   *
   * @example Multiples of two:
   *
   * ```ts
   * const Even = number.satisfying({ step: 2 });
   *
   * Even.as(-4); // -4
   *
   * Even.as(7);
   * // TypeError: Number is not a multiple of 2.
   * ```
   *
   * @example Multiples of two, with an offset of one:
   *
   * ```ts
   * const Odd = number.satisfying({ step: 2, stepFrom: 1 });
   *
   * Odd.as(7); // 7
   *
   * Odd.as(-4);
   * // TypeError: Number is not 1 plus a multiple of 2.
   * ```
   */
  satisfying(
    constraints: NumberConstraints
  ): NumberRefinementCake<number, number, this, NumberConstraintsRefinement> {
    return this.refined(new NumberConstraintsRefinement({ constraints }));
  }

  override refined<O extends number, R extends Refinement<number, O>>(
    refinement: R
  ): NumberRefinementCake<number, O, this, R> {
    return new NumberRefinementCake({ base: this, refinement });
  }

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
