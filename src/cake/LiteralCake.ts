import {
  Primitive,
  stringifyPrimitive,
  sameValueZero,
} from "../index-internal";

import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeRecipe,
  CakeError,
  CakeErrorDispatchFormatContext,
  StringTree,
} from "./index-internal";

/**
 * @public
 */
interface LiteralCakeRecipe<P extends Primitive> extends CakeRecipe {
  value: P;
}

/**
 * @public
 */
class LiteralCake<P extends Primitive>
  extends Cake<P>
  implements LiteralCakeRecipe<P>
{
  readonly value: P;

  constructor(recipe: LiteralCakeRecipe<P>) {
    super(recipe);
    this.value = recipe.value;
  }

  dispatchCheck(
    value: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeDispatchCheckContext
  ): CakeError | null {
    if (sameValueZero(this.value, value)) {
      return null;
    }
    return new LiteralNotEqualCakeError(this, value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchStringify(context: CakeDispatchStringifyContext): string {
    return stringifyPrimitive(this.value);
  }

  withName(name: string | null): LiteralCake<P> {
    return new LiteralCake({ ...this, name });
  }
}

/**
 * @public
 */
class LiteralNotEqualCakeError extends CakeError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(readonly cake: LiteralCake<any>, readonly value: unknown) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    return `Value does not equal ${stringifyPrimitive(this.cake.value)}.`;
  }
}

export { LiteralCake, LiteralCakeRecipe, LiteralNotEqualCakeError };
