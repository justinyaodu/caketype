import {
  NarrowestInput,
  Output,
  transform,
  Transform,
  TransformSpec,
  WidestInput,
} from "./transform";

type RecursiveUnionTypes<I, O, E, S> = S extends readonly []
  ? [I, O, E]
  : S extends [infer F, ...infer R]
  ? F extends TransformSpec
    ? RecursiveUnionTypes<
        I & WidestInput<F>,
        O | Output<F>,
        E | NarrowestInput<F>,
        R
      >
    : never
  : never;

type UnionTypes<S> = RecursiveUnionTypes<unknown, never, never, S>;

function union<S extends readonly [TransformSpec, ...TransformSpec[]]>(
  ...specs: S
): Transform<UnionTypes<S>[0], Output<S[number]>, UnionTypes<S>[2]> {
  return (input) => {
    for (const _spec of specs) {
      const spec: S[number] = _spec;
      try {
        // @ts-ignore ts(2589)
        return transform(input, spec);
      } catch {
        // TODO: error handling
      }
    }
    throw new Error("Union not satisfied");
  };
}

export { union };
