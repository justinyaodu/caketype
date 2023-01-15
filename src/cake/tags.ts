interface TagLike<L, T> {
  readonly tag: L;
  readonly untag: () => [L, T];
}

class Untagged implements TagLike<null, Untagged> {
  readonly tag = null;

  untag(): [null, this] {
    return [this.tag, this];
  }
}

class Tag<L, T> implements TagLike<L, T> {
  constructor(readonly tag: L, readonly untagged: T) {}

  untag(): [L, T] {
    return [this.tag, this.untagged];
  }
}

/**
 * Returned by {@link optional}.
 *
 * @public
 */
class OptionalTag<T> extends Tag<"optional", T> {
  constructor(untagged: T) {
    super("optional", untagged);
  }
}

/**
 * Used to indicate that a property is optional.
 *
 * @example
 * ```ts
 * const Person = bake({
 *   name: string,
 *   age: optional(number),
 * } as const);
 *
 * type Person = Infer<typeof Person>;
 * // { name: string, age?: number | undefined }
 * ```
 *
 * @public
 */
function optional<T>(value: T): OptionalTag<T> {
  return new OptionalTag(value);
}

export { Untagged, OptionalTag, optional };
