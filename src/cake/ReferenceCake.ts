import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  CakeRecipe,
  Infer,
} from "./index-internal";

/**
 * @public
 */
interface ReferenceCakeRecipe<C extends Cake> extends CakeRecipe {
  readonly get: () => C;
}

/**
 * @public
 */
class ReferenceCake<C extends Cake>
  extends Cake<Infer<C>>
  implements ReferenceCakeRecipe<C>
{
  readonly get: () => C;

  constructor(recipe: ReferenceCakeRecipe<C>) {
    super(recipe);
    this.get = recipe.get;
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
  get: () => C,
  name: string | null = null
): ReferenceCake<C> {
  return new ReferenceCake({ get, name });
}

export { ReferenceCake, ReferenceCakeRecipe, reference };
