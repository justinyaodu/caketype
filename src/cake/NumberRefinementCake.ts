import {
  Cake,
  NumberConstraints,
  NumberConstraintsRefinement,
  Refinement,
  RefinementCake,
} from "./index-internal";
import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  number,
} from "./index-internal";

/**
 * @public
 */
class NumberRefinementCake<
  I extends number,
  O extends I,
  B extends Cake<I>,
  R extends Refinement<I, O>
> extends RefinementCake<I, O, B, R> {
  /**
   * @see {@link number.satisfying}.
   */
  satisfying(
    constraints: NumberConstraints
  ): NumberRefinementCake<O, O, this, NumberConstraintsRefinement> {
    return this.refined(new NumberConstraintsRefinement({ constraints }));
  }

  override refined<P extends O, R extends Refinement<O, P>>(
    refinement: R
  ): NumberRefinementCake<O, P, this, R> {
    return new NumberRefinementCake({ base: this, refinement });
  }

  override withName(name: string | null): NumberRefinementCake<I, O, B, R> {
    return new NumberRefinementCake({ ...this, name });
  }
}

export { NumberRefinementCake };
