import { Primitive, isPrimitive, reprPrimitive } from "./primitive";

/**
 * Unique symbol used by {@link Transform} to retain the narrow input type. Not
 * used at runtime.
 */
const _NARROWED: unique symbol = Symbol("_NARROWED");

/**
 * A function that transforms `I`'s to `O`'s, or fails by throwing an exception.
 * Every input that isn't an `N` will always fail.
 *
 * @remarks
 *
 * Consider a function that takes any input, returns the length if the input
 * is a lowercase string, and throws an exception otherwise. This function has
 * a type of `Transform<unknown, number, string>`, because it can handle inputs
 * of type `unknown`, but only `string` inputs can be successfully transformed,
 * and it returns a `number`.
 *
 * Note that an input of type `N` can still fail. For example, an uppercase
 * string is still a `string`, but the function above would still throw an
 * exception. In general, `N` is used to exclude inputs that will always fail,
 * not guarantee that every input will be transformed successfully.
 *
 * @typeParam I - Inputs that the transform can handle
 * @typeParam O - Outputs that the transform can return
 * @typeParam N - Minimal superset of inputs that can be successfully transformed
 *
 * @see {@link WideInput}, {@link Output}, and {@link NarrowInput}, which
 * extract `I`, `O`, and `N` from existing transforms
 */
type Transform<I, O, N extends I = I> = ((input: I) => O) & {
  [_NARROWED]?: (input: N) => O;
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
 * A {@link TransformSpec} that can handle inputs of type `unknown`.
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
 * A transform spec for objects, where each property of the spec is a
 * `TransformSpec` for the corresponding key in the input.
 */
interface ObjectSpec {
  readonly [key: string]: UnknownTransformSpec;
}

/**
 * Modify an object type by removing fields that are always undefined, and
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
 * The widest type that this `TransformSpec` can accept as input.
 * @typeParam S - The spec to extract the wide input type from
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

type WideInput<S extends TransformSpec> = (
  S extends Transform<infer I, infer _O, infer _E>
    ? (input: I) => I
    : (input: unknown) => unknown
) extends (input: infer T) => unknown
  ? T
  : never;

/**
 * The type of the result after applying this `TransformSpec`.
 * @typeParam S - The spec to extract the output type from
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
  ? object &
      UndefinedToMissing<{
        -readonly [K in keyof S]: S[K] extends TransformSpec
          ? Output<S[K]>
          : never;
      }>
  : never;

/**
 * If an input does not satisfy this type, it will never be transformed
 * successfully by this `TransformSpec`.
 * @typeParam S - The spec to extract the narrow input type from
 */
type NarrowInput<S extends TransformSpec> = WideInput<S> &
  (S extends Transform<infer _I, infer _O, infer E>
    ? E
    : S extends Primitive
    ? S
    : S extends TupleSpec
    ? {
        readonly [K in keyof S]: K extends keyof []
          ? S[K]
          : S[K] extends TransformSpec
          ? NarrowInput<S[K]>
          : never;
      }
    : S extends ObjectSpec
    ? object &
        UndefinedToMissing<{
          readonly [K in keyof S]: S[K] extends TransformSpec
            ? NarrowInput<S[K]>
            : never;
        }>
    : never);

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

  const transformed = [];
  for (let i = 0; i < spec.length; i++) {
    // @ts-ignore ts(2589)
    transformed.push(transform(input[i], spec[i]));
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
    let inputValue: unknown;
    if (key in input) {
      inputValue = (input as Record<string, unknown>)[key];
    }
    // @ts-ignore ts(2589)
    const transformedValue = transform(inputValue, spec[key]);
    if (transformedValue !== undefined) {
      transformed[key] = transformedValue;
    }
    // TODO: per-element exception handling
  }

  return transformed as Output<S>;
}

function transform<S extends TransformSpec>(
  input: WideInput<S>,
  spec: S
): Output<S> {
  if (typeof spec === "function") {
    return (spec as Transform<WideInput<S>, Output<S>>)(input);
  }
  if (isPrimitive(spec)) {
    return transformPrimitive(input, spec) as Output<S>;
  }
  if (Array.isArray(spec)) {
    return transformTuple(input, spec as TupleSpec) as Output<S>;
  }
  return transformObject(input, spec as ObjectSpec) as Output<S>;
}

/**
 * Compile a {@link TransformSpec} into a {@link Transform} function.
 *
 * @remarks
 *
 * The returned function maintains a reference to `spec`, so any subsequent
 * modifications to `spec` will also change the function's behavior.
 *
 * @param spec - The spec to compile
 * @returns A {@link Transform} function which uses `spec`
 */
function compile<S extends TransformSpec>(
  spec: S
): // @ts-ignore ts(2589)
Transform<WideInput<S>, Output<S>, NarrowInput<S>> {
  if (typeof spec === "function") {
    return spec as Transform<WideInput<S>, Output<S>, NarrowInput<S>>;
  }
  return (input) => transform(input, spec);
}

function narrow<S extends TransformSpec>(
  spec: S
): Transform<NarrowInput<S>, Output<S>> {
  // @ts-ignore ts(2589)
  return compile(spec);
}

function narrowAndWide<S extends TransformSpec>(
  spec: S
): [
  Transform<NarrowInput<S>, Output<S>>,
  Transform<WideInput<S>, Output<S>, NarrowInput<S>>
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
  WideInput,
  Output,
  NarrowInput,
  transform,
  compile,
  narrow,
  narrowAndWide,
};
