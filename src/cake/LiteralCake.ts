import {
  Primitive,
  stringifyPrimitive,
  sameValueZero,
} from "../index-internal";

import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeArgs,
  CakeError,
  CakeErrorDispatchFormatContext,
  StringTree,
} from "./index-internal";

/**
 * @public
 */
interface LiteralCakeArgs<P extends Primitive> extends CakeArgs {
  value: P;
}

/**
 * @public
 */
class LiteralCake<P extends Primitive>
  extends Cake<P>
  implements LiteralCakeArgs<P>
{
  readonly value: P;

  constructor(args: LiteralCakeArgs<P>) {
    super(args);
    this.value = args.value;
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

export { LiteralCake, LiteralCakeArgs, LiteralNotEqualCakeError };
