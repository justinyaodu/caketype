import { assertPredicate, Predicate } from "./predicate";
import {
  NarrowInput,
  Output,
  transform,
  Transform,
  TransformSpec,
  WideInput,
} from "./transform";

function optional<S extends TransformSpec>(
  spec: S
): // @ts-ignore ts(2589)
Transform<
  WideInput<S> | undefined,
  Output<S> | undefined,
  NarrowInput<S> | undefined
> {
  return (input) => {
    if (input === undefined) {
      return undefined;
    }
    // @ts-ignore ts(2589)
    return transform(input, spec);
  };
}

type PipeOutput<O, T> = T extends readonly []
  ? O
  : T extends readonly [infer _F extends Transform<O, infer P>, ...infer R]
  ? PipeOutput<P, R>
  : never;

function pipe<S extends TransformSpec, O2>(
  spec: S,
  t2: Transform<Output<S>, O2>
): // @ts-ignore ts(2589)
Transform<WideInput<S>, O2, NarrowInput<S>>;

function pipe<S extends TransformSpec, O2, O3>(
  spec: S,
  t2: Transform<Output<S>, O2>,
  t3: Transform<O2, O3>
): Transform<WideInput<S>, O3, NarrowInput<S>>;

function pipe<S extends TransformSpec, O2, O3, O4>(
  spec: S,
  t2: Transform<Output<S>, O2>,
  t3: Transform<O2, O3>,
  t4: Transform<O3, O4>
): Transform<WideInput<S>, O4, NarrowInput<S>>;

function pipe<
  S extends TransformSpec,
  T extends readonly [Transform<never, unknown>, ...Transform<never, unknown>[]]
>(
  spec: S,
  ...transforms: T
): Transform<WideInput<S>, PipeOutput<Output<S>, T>, NarrowInput<S>> {
  return (input) => {
    let result: unknown = transform(input, spec);
    for (let i = 0; i < transforms.length; i++) {
      result = (transforms[i] as (input: unknown) => unknown)(result);
    }
    return result as PipeOutput<Output<S>, T>;
  };
}

type RecursiveUnionTypes<I, O, E, S> = S extends readonly []
  ? [I, O, E]
  : S extends [infer F extends TransformSpec, ...infer R]
  ? RecursiveUnionTypes<I & WideInput<F>, O | Output<F>, E | NarrowInput<F>, R>
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

// @ts-ignore ts(2589)
function withPredicates<S extends TransformSpec>(
  spec: S,
  ...predicates: Predicate<Output<S>>[]
): Transform<WideInput<S>, Output<S>, NarrowInput<S>> {
  return (input) => {
    const result = transform(input, spec);
    for (let i = 0; i < predicates.length; i++) {
      assertPredicate(predicates[i], result);
    }
    // @ts-ignore ts(2589)
    return result;
  };
}

export { optional, pipe, union, withPredicates };
