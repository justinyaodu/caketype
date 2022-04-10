import { assertPredicate, Predicate } from "./predicate";
import { isPrimitive, Primitive, reprPrimitive } from "./primitive";

type Transform<I, O, E = unknown> = (input: I) => O;

type TransformSpec = Primitive | Transform<unknown, unknown> | TupleSpec | ObjectSpec;

type TupleSpec = readonly [] | readonly [TransformSpec, ...TransformSpec[]];

interface ObjectSpec {
  readonly [key: string]: TransformSpec;
}

// https://stackoverflow.com/a/50375286
type UnionToIntersection<U> = (U extends any ? (u: U) => void : never) extends ((u: infer I) => void) ? I : never;

type UndefinedToMissing<T> = UnionToIntersection<
  {
    [K in keyof T]: (
      T[K] extends undefined
        ? {} // Value is always undefined; delete the field.
        : undefined extends T[K]
          ? {[key in K]?: T[K]} // Value is sometimes undefined; make the field optional.
          : {[key in K]: T[K]} // Value is never undefined; make the field required.
    )
  }[keyof T]
>;

type NarrowestInput<S> = (
  S extends Primitive
  ? S
  : S extends Transform<infer I, infer O, infer E>
    ? I & E 
      : S extends TupleSpec
        ? {readonly [K in keyof S]: K extends keyof [] ? S[K] : NarrowestInput<S[K]>}
        : S extends ObjectSpec
          ? UndefinedToMissing<{readonly [K in keyof S]: NarrowestInput<S[K]>}>
          : never
);

type WidestInput<S> = (
  S extends Primitive
  ? unknown
  : S extends Transform<infer I, infer O, infer E>
    ? I 
      : S extends TupleSpec
        ? unknown
        : S extends ObjectSpec
          ? unknown
          : never
);

type Output<S> = (
  S extends Primitive
    ? S
    : S extends Transform<infer I, infer O, infer E>
      ? O 
      : S extends TupleSpec
        ? {-readonly [K in keyof S]: K extends keyof [] ? S[K] : Output<S[K]>}
        : S extends ObjectSpec
          ? UndefinedToMissing<{-readonly [K in keyof S]: Output<S[K]>}>
          : never
);

function transformPrimitive<S extends Primitive>(input: WidestInput<S>, spec: S): Output<S> {
  if (input === spec) {
    return spec as Output<S>;
  }
  throw new Error(`Not equal to ${reprPrimitive(spec)}`);
}

function transformTuple<S extends TupleSpec>(input: WidestInput<S>, spec: S): Output<S> {
  if (!Array.isArray(input)) {
    throw new Error("Not an array");
  }
  if (input.length !== spec.length) {
    throw new Error(`Length is not ${spec.length}`);
  }

  const transformed: unknown[] = [];
  for (let i = 0; i < spec.length; i++) {
    // @ts-ignore
    const transformedValue = transform(input[i], spec[i]);
    transformed.push(transformedValue);
    // TODO: per-element exception handling
  }
  return transformed as Output<S>;
}

function transformObject<S extends ObjectSpec>(input: WidestInput<S>, spec: S): Output<S> {
  if (typeof input !== "object" || input === null) {
    throw new Error("Not an object");
  }

  for (const key of Object.getOwnPropertyNames(input)) {
    if (!(key in spec)) {
      throw new Error(`Unrecognized key: ${reprPrimitive(key)}`);
    }
  }

  const transformed: {[key: string]: unknown} = {};
  for (const key of Object.getOwnPropertyNames(spec)) {
    const inputValue: unknown = (input as any)[key];
    const transformedValue = transform(inputValue, spec[key]);
    if (transformedValue !== undefined) {
      transformed[key] = transformedValue;
    }
    // TODO: per-element exception handling
  }

  return transformed as Output<S>;
}

function transform<S extends TransformSpec>(input: WidestInput<S>, spec: S): Output<S> {
  if (isPrimitive(spec)) {
    return transformPrimitive(input, spec) as Output<S>;
  }
  if (typeof spec === "function") {
    const transformer = spec as Transform<WidestInput<S>, Output<S>>;
    return transformer(input);
  }
  if (Array.isArray(spec)) {
    return transformTuple(input, spec as TupleSpec) as Output<S>;
  }
  return transformObject(input, spec as ObjectSpec) as Output<S>;
}

/*
function compile<S extends TransformSpec>(spec: S): Transform<WidestInput<S>, Output<S>, NarrowestInput<S>> {
  return (input) => transform(input, spec);
}

const boolean: Transform<unknown, boolean, boolean> = (input) => {
  if (typeof input === "boolean") {
    return input;
  }
  throw new Error("Not a boolean");
}

const number: Transform<unknown, number, number> = (input) => {
  if (typeof input === "number") {
    return input;
  }
  throw new Error("Not a number");
}

function optional<S extends TransformSpec>(spec: S): Transform<WidestInput<S> | undefined, Output<S> | undefined, NarrowestInput<S> | undefined> {
  return (input) => {
    if (input === undefined) {
      return undefined;
    }
    return transform(input, spec);
  };
}

const specNumberValidation = {
  min: optional(number),
  max: optional(number),
  multipleOf: optional(number),
  integer: optional(boolean),
  finite: optional(boolean),
};

type NumberValidation = Output<typeof specNumberValidation>;

function aNumber(...validators: (Predicate<Number> | NumberValidation)[]): Transform<unknown, number, number> {
  return (input) => {
    const n = number(input);
    for (const validator of validators) {
      if (typeof validator === "function") {
        assertPredicate(validator, n);
      }
    }
    return n;
  }
}
*/

export {
  Transform,
  TransformSpec,
  TupleSpec,
  ObjectSpec,
  NarrowestInput,
  WidestInput,
  Output,
  transform,
}
