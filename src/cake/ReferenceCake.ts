import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  CakeArgs,
  Infer,
} from "./index-internal";

/**
 * @public
 */
interface ReferenceCakeArgs<C extends Cake> extends CakeArgs {
  readonly get: () => C;
}

/**
 * @public
 */
class ReferenceCake<C extends Cake>
  extends Cake<Infer<C>>
  implements ReferenceCakeArgs<C>
{
  readonly get: () => C;

  constructor(args: ReferenceCakeArgs<C>) {
    super(args);
    this.get = args.get;
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

  withName(name: string | null): ReferenceCake<C> {
    return new ReferenceCake({ ...this, name });
  }
}

/**
 * @public
 */
function reference<T, C extends Cake<T> = Cake<T>>(
  get: () => C,
  name: string | null = null
): ReferenceCake<C> {
  return new ReferenceCake({ get, name });
}

export { ReferenceCake, ReferenceCakeArgs, reference };
