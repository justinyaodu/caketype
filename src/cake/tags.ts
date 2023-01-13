interface TagLike<L, T> {
  readonly tag: L;
  readonly untagged: T;
  readonly untag: () => [L, T];
}

class Untagged implements TagLike<null, Untagged> {
  readonly tag = null;
  readonly untagged = this;

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

class RestTag<T> extends Tag<"rest", T> {
  constructor(untagged: T) {
    super("rest", untagged);
  }
}

export { TagLike, Untagged, OptionalTag, RestTag };
