import {
  bake,
  Bakeable,
  Baked,
  Cake,
  CakeArgs,
  TupleCake,
} from "./index-internal";

/**
 * @public
 */
interface ArrayCakeArgs<C extends Cake> extends CakeArgs {
  element: C;
}

/**
 * @public
 */
class ArrayCake<C extends Cake = Cake>
  extends TupleCake<readonly [], readonly [], C, readonly []>
  implements ArrayCakeArgs<C>
{
  readonly element: C;

  constructor(args: ArrayCakeArgs<C>) {
    const { element, ...base } = args;
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
 *
 * @public
 */
function array<B extends Bakeable>(bakeable: B): ArrayCake<Baked<B>> {
  return new ArrayCake({
    element: bake(bakeable),
  }) as ArrayCake<Baked<B>>;
}

export { ArrayCake, ArrayCakeArgs, array };
