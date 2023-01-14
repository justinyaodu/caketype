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

class OptionalTag<T> extends Tag<"optional", T> {
  constructor(untagged: T) {
    super("optional", untagged);
  }
}

function optional<T>(value: T): OptionalTag<T> {
  return new OptionalTag(value);
}

export { Untagged, OptionalTag, optional };
