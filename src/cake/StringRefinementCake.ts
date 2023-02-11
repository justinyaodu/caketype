import {
  Cake,
  StringConstraints,
  StringConstraintsRefinement,
  Refinement,
  RefinementCake,
} from "./index-internal";
import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  string,
} from "./index-internal";

/**
 * @public
 */
class StringRefinementCake<
  I extends string,
  O extends I,
  B extends Cake<I>,
  R extends Refinement<I, O>
> extends RefinementCake<I, O, B, R> {
  /**
   * @see {@link string.satisfying}.
   */
  satisfying(
    constraints: StringConstraints
  ): StringRefinementCake<O, O, this, StringConstraintsRefinement> {
    return this.refined(new StringConstraintsRefinement({ constraints }));
  }

  override refined<P extends O, R extends Refinement<O, P>>(
    refinement: R
  ): StringRefinementCake<O, P, this, R> {
    return new StringRefinementCake({ base: this, refinement });
  }

  override withName(name: string | null): StringRefinementCake<I, O, B, R> {
    return new StringRefinementCake({ ...this, name });
  }
}

export { StringRefinementCake };
