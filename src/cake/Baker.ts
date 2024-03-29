import { isPrimitive, mapValuesUnsound, Primitive } from "../index-internal";

import {
  Cake,
  LiteralCake,
  ObjectCake,
  optional,
  OptionalTag,
} from "./index-internal";
import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Infer,
} from "./index-internal";

/**
 * A convenient syntax for type definitions. Used by {@link bake}.
 * @public
 */
// TODO: add Class and tuples
type Bakeable = Cake | Primitive | ObjectBakeable;

/**
 * Define an object type that can be {@link bake}d into an {@link ObjectCake}.
 * @public
 */
type ObjectBakeable = {
  [key: string | symbol]: Bakeable | OptionalTag<Bakeable>;
};

/**
 * The return type of {@link bake} for a given {@link Bakeable}.
 * @public
 */
type Baked<B extends Bakeable> = B extends Cake
  ? B
  : B extends Primitive
  ? LiteralCake<B>
  : B extends ObjectBakeable
  ? ObjectCake<{
      -readonly [K in keyof B]: B[K] extends OptionalTag<
        infer I extends Bakeable
      >
        ? OptionalTag<Baked<I>>
        : B[K] extends Bakeable
        ? Baked<B[K]>
        : never;
    }>
  : never;

class Baker {
  bake<B extends Bakeable>(bakeable: B): Baked<B> {
    return this.bakeVisit(bakeable);
  }

  protected bakeVisit<B extends Bakeable>(bakeable: B): Baked<B> {
    // TODO: caching and circular reference detection
    return this.bakeDispatch(bakeable);
  }

  protected bakeDispatch<B extends Bakeable>(bakeable: B): Baked<B>;
  protected bakeDispatch(bakeable: Bakeable): Cake {
    if (bakeable instanceof Cake) {
      return bakeable;
    } else if (isPrimitive(bakeable)) {
      return new LiteralCake({ value: bakeable });
    } else {
      return new ObjectCake({
        properties: mapValuesUnsound(bakeable as ObjectBakeable, (value) =>
          value instanceof OptionalTag
            ? optional(this.bakeVisit(value.untagged))
            : this.bakeVisit(value)
        ),
      });
    }
  }
}

/**
 * Create a {@link Cake} from a {@link Bakeable} type definition.
 *
 * @example
 * ```ts
 * const Person = bake({
 *   name: string,
 *   age: optional(number),
 * });
 *
 * Person.is({ name: "Alice" }); // true
 * ```
 *
 * @example Use {@link Infer} to get the TypeScript type represented by a Cake:
 *
 * ```ts
 * type Person = Infer<typeof Person>;
 * // { name: string, age?: number | undefined }
 *
 * const bob: Person = { name: "Bob", age: 42 };
 * ```
 *
 * @public
 */
function bake<B extends Bakeable>(bakeable: B): Baked<B> {
  return new Baker().bake(bakeable);
}

export { Bakeable, ObjectBakeable, bake, Baked };
