import { valuesUnsound } from "../index-internal";

import {
  bake,
  Bakeable,
  Cake,
  CakeArgs,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  CakeErrorDispatchFormatContext,
  MapBaked,
  MapInfer,
  StringTree,
} from "./index-internal";

/**
 * @public
 */
interface UnionCakeArgs<M extends readonly Cake[]> extends CakeArgs {
  members: M;
}

/**
 * @internal
 */
type FoldUnion<T extends readonly unknown[]> = T extends readonly []
  ? never
  : T extends readonly [infer F, ...infer R]
  ? F | FoldUnion<R>
  : T[number];

/**
 * @public
 */
class UnionCake<M extends readonly Cake[]>
  extends Cake<FoldUnion<MapInfer<M>>>
  implements UnionCakeArgs<M>
{
  readonly members: M;

  constructor(args: UnionCakeArgs<M>) {
    super(args);
    this.members = args.members;
  }

  dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null {
    const { recurse } = context;
    const errors: Record<string, CakeError> = {};
    for (let i = 0; i < this.members.length; i++) {
      const error = recurse(this.members[i], value);
      if (error === null) {
        return null;
      }
      errors[i] = error;
    }
    return new UnionCakeError(this, value, errors);
  }

  dispatchStringify(context: CakeDispatchStringifyContext): string {
    if (this.members.length === 0) {
      return "never (empty union)";
    }

    const { recurse } = context;

    if (this.members.length === 1) {
      return recurse(this.members[0]);
    }

    return this.members.map((cake) => `(${recurse(cake)})`).join(" | ");
  }

  withName(name: string | null): UnionCake<M> {
    return new UnionCake({ ...this, name });
  }
}

/**
 * @public
 */
class UnionCakeError extends CakeError {
  constructor(
    readonly cake: UnionCake<readonly Cake[]>,
    readonly value: unknown,
    readonly errors: Record<string, CakeError>
  ) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { recurse, stringifyCake } = context;

    const message = `Value does not satisfy type '${stringifyCake(
      this.cake
    )}': none of the union member(s) are satisfied.`;

    return [message, valuesUnsound(this.errors).map((err) => recurse(err))];
  }
}

/**
 * Return a {@link Cake} representing a union of the specified types.
 *
 * @example Union members can be existing Cakes:
 *
 * ```ts
 * // like the TypeScript type 'string | number'
 * const StringOrNumber = union(string, number);
 *
 * StringOrNumber.is("hello"); // true
 * StringOrNumber.is(7); // true
 * StringOrNumber.is(false); // false
 * ```
 *
 * @example Union members can also be primitive values, or any other {@link Bakeable}s:
 *
 * ```ts
 * const Color = union("red", "green", "blue");
 * type Color = Infer<typeof Color>; // "red" | "green" | "blue"
 *
 * Color.is("red"); // true
 * Color.is("oops"); // false
 * ```
 *
 * @public
 */
function union<M extends readonly [Bakeable, ...Bakeable[]]>(
  ...members: M
): UnionCake<MapBaked<M>> {
  return new UnionCake({ members: members.map((b) => bake(b)) }) as UnionCake<
    MapBaked<M>
  >;
}

export { UnionCake, UnionCakeArgs, UnionCakeError, union };
