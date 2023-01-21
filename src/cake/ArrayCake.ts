import {
  bake,
  Bakeable,
  Baked,
  Cake,
  CakeRecipe,
  TupleCake,
} from "./index-internal";

interface ArrayCakeRecipe<C extends Cake> extends CakeRecipe {
  element: C;
}

class ArrayCake<C extends Cake = Cake>
  extends TupleCake<readonly [], readonly [], C, readonly []>
  implements ArrayCakeRecipe<C>
{
  readonly element: C;

  constructor(recipe: ArrayCakeRecipe<C>) {
    const { element, ...base } = recipe;
    super({
      ...base,
      startElements: [],
      optionalElements: [],
      restElement: element,
      endElements: [],
    });
    this.element = element;
  }

  override withName(name: string | null): ArrayCake<C> {
    return new ArrayCake({ ...this, name });
  }
}

/**
 * Return a {@link Cake} representing an array of the specified type.
 *
 * @example
 *
 * ```ts
 * const nums = array(number);
 *
 * nums.is([2, 3]); // true
 * nums.is([]); // true
 *
 * nums.is(["oops"]); // false
 * nums.is({}); // false
 * ```
 */
function array<B extends Bakeable>(bakeable: B): ArrayCake<Baked<B>> {
  return new ArrayCake({
    element: bake(bakeable),
  }) as ArrayCake<Baked<B>>;
}

export { ArrayCake, ArrayCakeRecipe, array };
