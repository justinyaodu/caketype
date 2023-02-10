import {
  Cake,
  CakeArgs,
  CakeError,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  Refinement,
} from "./index-internal";

/**
 * @public
 */
interface RefinementCakeArgs<
  I,
  O extends I,
  B extends Cake<I>,
  R extends Refinement<I, O>
> extends CakeArgs {
  readonly base: B;
  readonly refinement: R;
}

/**
 * @public
 */
class RefinementCake<
    I,
    O extends I,
    B extends Cake<I>,
    R extends Refinement<I, O>
  >
  extends Cake<O>
  implements RefinementCakeArgs<I, O, B, R>
{
  readonly base: B;
  readonly refinement: R;

  constructor(args: RefinementCakeArgs<I, O, B, R>) {
    super(args);
    this.base = args.base;
    this.refinement = args.refinement;
  }

  dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null {
    const { recurse } = context;
    const baseError = recurse(this.base, value);
    if (baseError !== null) {
      return baseError;
    }
    return this.refinement.check(value as I).errorOr(null);
  }

  dispatchStringify(context: CakeDispatchStringifyContext): string {
    const { recurse } = context;
    return `(${recurse(this.base)}).refined(${this.refinement.toString()})`;
  }

  withName(name: string | null): RefinementCake<I, O, B, R> {
    return new RefinementCake({ ...this, name });
  }
}

export { RefinementCake, RefinementCakeArgs };
