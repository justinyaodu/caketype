import { assertPredicate, Predicate } from "./predicate";
import {
  NarrowestInput,
  Output,
  transform,
  Transform,
  TransformSpec,
  WidestInput,
} from "./transform";

type PipeOutput<O, T> = T extends readonly []
  ? O
  : T extends readonly [infer F, ...infer R]
  ? F extends Transform<O, infer P>
    ? PipeOutput<P, R>
    : never
  : never;

function pipe<S extends TransformSpec, O2>(
  spec: S,
  t2: Transform<Output<S>, O2>
): // @ts-ignore ts(2589)
Transform<WidestInput<S>, O2, NarrowestInput<S>>;
function pipe<S extends TransformSpec, O2, O3>(
  spec: S,
  t2: Transform<Output<S>, O2>,
  t3: Transform<O2, O3>
): Transform<WidestInput<S>, O3, NarrowestInput<S>>;
function pipe<S extends TransformSpec, O2, O3, O4>(
  spec: S,
  t2: Transform<Output<S>, O2>,
  t3: Transform<O2, O3>,
  t4: Transform<O3, O4>
): Transform<WidestInput<S>, O4, NarrowestInput<S>>;
function pipe<
  S extends TransformSpec,
  T extends readonly [Transform<never, unknown>, ...Transform<never, unknown>[]]
>(
  spec: S,
  ...transforms: T
): Transform<WidestInput<S>, PipeOutput<Output<S>, T>, NarrowestInput<S>> {
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

// @ts-ignore ts(2589)
function validator<S extends TransformSpec>(
  spec: S,
  ...predicates: Predicate<Output<S>>[]
): Transform<WidestInput<S>, Output<S>, NarrowestInput<S>> {
  return (input) => {
    const result = transform(input, spec);
    for (let i = 0; i < predicates.length; i++) {
      assertPredicate(predicates[i], result);
    }
    // @ts-ignore ts(2589)
    return result;
  };
}

export { pipe, union, validator };
