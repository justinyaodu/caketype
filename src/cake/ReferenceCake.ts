import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  Infer,
} from "./index-internal";

/**
 * @public
 */
class ReferenceCake<C extends Cake> extends Cake<Infer<C>> {
  constructor(readonly get: () => C) {
    super();
  }

  dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null {
    const { recurse } = context;
    return recurse(this.get(), value);
  }

  dispatchStringify(context: CakeDispatchStringifyContext): string {
    const { recurse } = context;
    return `reference(() => ${recurse(this.get())})`;
  }
}

/**
 * @public
 */
function reference<T, C extends Cake<T> = Cake<T>>(
  get: () => C
): ReferenceCake<C> {
  return new ReferenceCake(get);
}

export { ReferenceCake, reference };
