import {
  CakeError,
  CakeErrorDispatchFormatContext,
  number,
  Refinement,
  StringTree,
} from "./index-internal";

/**
 * @see {@link integer}.
 *
 * @public
 */
class IntegerRefinement extends Refinement<number> {
  dispatchCheck(value: number): CakeError | null {
    if (!Number.isInteger(value)) {
      return new NotAnIntegerCakeError(value);
    }
    return null;
  }

  toString(): string {
    return "is an integer";
  }
}

class NotAnIntegerCakeError extends CakeError {
  constructor(readonly value: number) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    return "Number is not an integer.";
  }
}

/**
 * Like {@link number}, but only allow numbers with integer values.
 *
 * @example
 * ```ts
 * integer.is(5); // true
 * integer.is(5.5); // false
 * ```
 *
 * @example Constraints are supported as well:
 *
 * ```ts
 * const NonNegativeInteger = integer.satisfying({ min: 0 });
 * NonNegativeInteger.is(5); // true
 * NonNegativeInteger.is(-1); // false
 * ```
 *
 * @see {@link number.satisfying}.
 *
 * @public
 */
const integer = number.refined(new IntegerRefinement()).withName("integer");

export { IntegerRefinement, integer };
