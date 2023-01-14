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
    { recurse }: CakeDispatchCheckContext
  ): CakeError | null {
    return recurse(this.get(), value);
  }

  dispatchStringify({ recurse }: CakeDispatchStringifyContext): string {
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
