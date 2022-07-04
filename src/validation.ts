import { optional, union } from "./combinators";
import { boolean, number, string } from "./terminals";
import {
  NarrowInput,
  Output,
  transform,
  Transform,
  TransformSpec,
} from "./transform";

const specBooleanValidation = {
  equals: optional(boolean),
};

const specNumberValidation = {
  equals: optional(number),
  finite: optional(boolean),
  min: optional(number),
  max: optional(number),
  step: optional(number),
};

const specArrayValidation = {
  // It would be misleading to use `integer` instead of `number`, because we
  // wouldn't actually use this spec to check that it's an integer.
  length: optional(union(number, specNumberValidation)),
};

const specStringValidation = {
  equals: optional(string),
  length: optional(union(number, specNumberValidation)),
  startsWith: optional(string),
  endsWith: optional(string),
  regex: optional(string),
  innerRegex: optional(string),
};

type ArrayValidation = NarrowInput<typeof specArrayValidation>;
type BooleanValidation = NarrowInput<typeof specBooleanValidation>;
type NumberValidation = NarrowInput<typeof specNumberValidation>;
type StringValidation = NarrowInput<typeof specStringValidation>;

function validateBoolean(
  input: unknown,
  validation: BooleanValidation
): boolean {
  const b = boolean(input);
  if (validation.equals !== undefined && b !== validation.equals) {
    throw new Error("Boolean does not equal expected value");
  }
  return b;
}

function booleanValidatedBy(
  validation: BooleanValidation
): Transform<unknown, boolean, boolean> {
  return (input) => validateBoolean(input, validation);
}

const integer: Transform<unknown, number, number> = (input) => {
  const n = number(input);
  if (!Number.isInteger(n)) {
    throw new Error("Number is not an integer");
  }
  return n;
};

function checkNumberValidation(
  n: number,
  validation: number | NumberValidation
): number {
  if (typeof validation === "number") {
    validation = { equals: validation };
  }
  if (validation.equals !== undefined) {
    const same =
      n == validation.equals ||
      (Number.isNaN(n) && Number.isNaN(validation.equals));
    if (!same) {
      throw new Error("Number does not equal expected value");
    }
  }
  if (
    validation.finite !== undefined &&
    Number.isFinite(n) !== validation.finite
  ) {
    throw new Error(
      validation.finite ? "Number is not finite" : "Number is finite"
    );
  }
  if (validation.min !== undefined && n < validation.min) {
    throw new Error("Number less than minimum");
  }
  if (validation.max !== undefined && n > validation.max) {
    throw new Error("Number greater than maximum");
  }
  if (validation.step !== undefined && n % validation.step !== 0) {
    throw new Error("Number does not satisfy step");
  }
  return n;
}

function validateInteger(input: unknown, validation: NumberValidation): number {
  return checkNumberValidation(integer(input), validation);
}

function integerValidatedBy(
  validation: NumberValidation
): Transform<unknown, number, number> {
  return (input) => validateInteger(input, validation);
}

function validateNumber(input: unknown, validation: NumberValidation): number {
  return checkNumberValidation(number(input), validation);
}

function numberValidatedBy(
  validation: NumberValidation
): Transform<unknown, number, number> {
  return (input) => validateNumber(input, validation);
}

function regexTestFull(regex: string, input: string): boolean {
  return new RegExp("^" + regex + "$").test(input);
}

function validateString(input: unknown, validation: StringValidation): string {
  const s = string(input);
  if (validation.equals !== undefined && s !== validation.equals) {
    throw new Error("String does not equal the expected value");
  }
  if (validation.length !== undefined) {
    checkNumberValidation(s.length, validation.length);
  }
  if (
    validation.startsWith !== undefined &&
    !s.startsWith(validation.startsWith)
  ) {
    throw new Error("String does not start with the required prefix");
  }
  if (validation.endsWith !== undefined && !s.endsWith(validation.endsWith)) {
    throw new Error("String does not end with the required suffix");
  }
  if (validation.regex !== undefined && !regexTestFull(validation.regex, s)) {
    throw new Error("String does not match regex");
  }
  if (validation.innerRegex !== undefined) {
    const prefixLength = validation.startsWith?.length || 0;
    const suffixLength = validation.endsWith?.length || 0;
    const inner = s.slice(prefixLength, s.length - suffixLength);
    if (!regexTestFull(validation.innerRegex, inner)) {
      throw new Error("String does not match inner regex");
    }
  }
  return s;
}

function stringValidatedBy(
  validation: StringValidation
): Transform<unknown, string, string> {
  return (input) => validateString(input, validation);
}

function transformArray<S extends TransformSpec>(
  input: unknown,
  spec: S,
  validation?: number | ArrayValidation
): Output<S>[] {
  if (!Array.isArray(input)) {
    throw new Error("Not an array");
  }
  if (typeof validation === "number") {
    validation = { length: { equals: validation } };
  }
  if (validation?.length !== undefined) {
    checkNumberValidation(input.length, validation.length);
  }
  const output: Output<S>[] = [];
  for (const element of input) {
    // @ts-ignore ts(2589)
    const transformed: Output<S> = transform(element, spec);
    output.push(transformed);
  }
  return output;
}

function arrayOf<S extends TransformSpec>(
  spec: S,
  validation?: number | ArrayValidation
): Transform<unknown, Output<S>[], NarrowInput<S>[]> {
  return (input) => transformArray(input, spec, validation);
}

export {
  ArrayValidation,
  arrayOf,
  booleanValidatedBy,
  integer,
  integerValidatedBy,
  NumberValidation,
  numberValidatedBy,
  specArrayValidation,
  specBooleanValidation,
  specNumberValidation,
  specStringValidation,
  StringValidation,
  stringValidatedBy,
  validateBoolean,
  validateInteger,
  validateNumber,
  validateString,
};
