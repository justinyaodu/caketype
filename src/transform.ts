import { Primitive, isPrimitive, reprPrimitive } from "./primitive";

/**
 * Unique symbol used by `Transform`s to retain the narrowest input type for
 * type inference. Not used at runtime.
 */
const _NARROWED: unique symbol = Symbol("_NARROWED");

/**
 * A function that transforms an input type to an output type.
 * @typeParam I - widest input that the transform can handle
 * @typeParam O - output of the transform
 * @typeParam E - narrowest input that can be successfully transformed
 */
// type Transform<I, O, E = I> = (input: I | E) => O;
type Transform<I, O, E extends I = I> = ((input: I) => O) & {
  [_NARROWED]?: (input: E) => O;
};

/**
 * Any transform spec.
 */
type TransformSpec =
  | Transform<never, unknown, never>
  | Primitive
  | TupleSpec
  | ObjectSpec;

/**
 * A transform spec that can handle inputs of type `unknown`.
 */
type UnknownTransformSpec =
  | Transform<unknown, unknown, never>
  | Primitive
  | TupleSpec
  | ObjectSpec;

/**
 * A transform spec for tuples, where each element of the spec is a
 * `TransformSpec` for the corresponding element of the input.
 */
type TupleSpec =
  | readonly []
  | readonly [UnknownTransformSpec, ...UnknownTransformSpec[]];

/**
 * A transform spec for objects, where each field of the spec is a
 * `TransformSpec` for the corresponding key in the input.
 */
interface ObjectSpec {
  readonly [key: string]: UnknownTransformSpec;
}

// Use contravariance of function parameters to convert union to intersection.
// https://stackoverflow.com/a/50375286
type UnionToIntersection<U> = (
  U extends unknown ? (u: U) => void : never
) extends (u: infer I) => void
  ? I
  : never;

/**
 * Modify an object type by removing fields that are always undefined and
 * marking fields that could be undefined as optional.
 */
type UndefinedToMissing<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as T[K] extends undefined
    ? never
    : undefined extends T[K]
    ? K
    : never]?: T[K];
};

/**
 * The narrowest type that can be successfully transformed by a `TransformSpec`.
 */
type NarrowestInput<S extends TransformSpec> = WidestInput<S> &
  (S extends Transform<infer _I, infer _O, infer E>
    ? E
    : S extends Primitive
    ? S
    : S extends TupleSpec
    ? {
        readonly [K in keyof S]: K extends keyof []
          ? S[K]
          : S[K] extends TransformSpec
          ? NarrowestInput<S[K]>
          : never;
      }
    : S extends ObjectSpec
    ? UndefinedToMissing<{
        readonly [K in keyof S]: S[K] extends TransformSpec
          ? NarrowestInput<S[K]>
          : never;
      }>
    : never);

/**
 * The widest type that a `TransformSpec` can take as input.
 */

// If S is a union, the widest input should be the intersection of the widest
// input of each union member. A naive implementation with `? I : unknown`
// would incorrectly return the union of the widest inputs, because
// `WidestInput<A | B>` would become `WidestInput<A> | WidestInput<B>`.

// We can't fix this with `UnionToIntersection`, because a union like
// `boolean | unknown` would collapse to `unknown` before `UnionToIntersection`
// could undo it. We first wrap the input type in a function `(input: I) => I`
// to prevent collapsing, then infer the parameter type of this union of
// functions to get the intersection.

type WidestInput<S extends TransformSpec> = (
  S extends Transform<infer I, infer _O, infer _E>
    ? (input: I) => I
    : (input: unknown) => unknown
) extends (input: infer T) => unknown
  ? T
  : never;

/**
 * The type of the result after applying a `TransformSpec`.
 */
type Output<S extends TransformSpec> = S extends Transform<
  infer _I,
  infer O,
  infer _E
>
  ? O
  : S extends Primitive
  ? S
  : S extends TupleSpec
  ? {
      -readonly [K in keyof S]: K extends keyof []
        ? S[K]
        : S[K] extends TransformSpec
        ? Output<S[K]>
        : never;
    }
  : S extends ObjectSpec
  ? UndefinedToMissing<{
      -readonly [K in keyof S]: S[K] extends TransformSpec
        ? Output<S[K]>
        : never;
    }>
  : never;

function transformPrimitive<S extends Primitive>(input: unknown, spec: S): S {
  if (input === spec) {
    return spec;
  }
  throw new Error(`Not equal to ${reprPrimitive(spec)}`);
}

function transformTuple<S extends TupleSpec>(
  input: unknown,
  spec: S
): Output<S> {
  if (!Array.isArray(input)) {
    throw new Error("Not an array");
  }
  if (input.length !== spec.length) {
    throw new Error(`Length is not ${spec.length}`);
  }

  // @ts-ignore ts(2589)
  const transformed: Output<S>[number][] = [];
  for (let i = 0; i < spec.length; i++) {
    const elementSpec: S[number] = spec[i];
    transformed.push(transform(input[i], elementSpec));
    // TODO: per-element exception handling
  }
  return transformed as Output<S>;
}

function transformObject<S extends ObjectSpec>(
  input: unknown,
  spec: S
): Output<S> {
  if (typeof input !== "object" || input === null) {
    throw new Error("Not an object");
  }

  for (const key of Object.getOwnPropertyNames(input)) {
    if (!(key in spec)) {
      throw new Error(`Unrecognized key: ${reprPrimitive(key)}`);
    }
  }

  const transformed: { [key: string]: unknown } = {};
  for (const key of Object.getOwnPropertyNames(spec)) {
    const inputValue: unknown = input[key as keyof typeof input];
    const transformedValue = transform(inputValue, spec[key]);
    if (transformedValue !== undefined) {
      transformed[key] = transformedValue;
    }
    // TODO: per-element exception handling
  }

  return transformed as Output<S>;
}

function transform<S extends TransformSpec>(
  input: WidestInput<S>,
  spec: S
): Output<S> {
  if (typeof spec === "function") {
    return (spec as Transform<WidestInput<S>, Output<S>>)(input);
  }
  if (isPrimitive(spec)) {
    return transformPrimitive(input, spec) as Output<S>;
  }
  if (Array.isArray(spec)) {
    return transformTuple(input, spec as TupleSpec) as Output<S>;
  }
  return transformObject(input, spec as ObjectSpec) as Output<S>;
}

function compile<S extends TransformSpec>(
  spec: S
): // @ts-ignore ts(2589)
Transform<WidestInput<S>, Output<S>, NarrowestInput<S>> {
  if (typeof spec === "function") {
    return spec as Transform<WidestInput<S>, Output<S>, NarrowestInput<S>>;
  }
  return (input) => transform(input, spec);
}

function narrow<S extends TransformSpec>(
  spec: S
): Transform<NarrowestInput<S>, Output<S>> {
  return compile(spec);
}

function narrowAndWide<S extends TransformSpec>(
  spec: S
): [
  Transform<NarrowestInput<S>, Output<S>>,
  Transform<WidestInput<S>, Output<S>, NarrowestInput<S>>
] {
  const compiled = compile(spec);
  return [compiled, compiled];
}

export {
  Transform,
  TransformSpec,
  UnknownTransformSpec,
  TupleSpec,
  ObjectSpec,
  WidestInput,
  Output,
  NarrowestInput,
  transform,
  compile,
  narrow,
  narrowAndWide,
};
