import { optional, union } from "./combinators";
import { boolean, number, string } from "./terminals";
import { NarrowestInput, Transform } from "./transform";

const integer: Transform<unknown, number, number> = (input) => {
  const n = number(input);
  if (!Number.isInteger(n)) {
    throw new Error("Number is not an integer");
  }
  return n;
};

const specNumberValidation = {
  finite: optional(boolean),
  min: optional(number),
  max: optional(number),
  step: optional(number),
};

// Since every property of a number validation object is optional, weird values
// like arrays and numbers also satisfy this type. However, using these as
// number validation objects is most likely a bug.

// TypeScript doesn't have a way to disallow extra keys entirely, but we can
// disallow number and symbol keys to catch the most obvious issues.

type NumberValidation = Record<number | symbol, never> &
  NarrowestInput<typeof specNumberValidation>;

const specStringValidation = {
  length: optional(union(number, specNumberValidation)),
  startsWith: optional(string),
  endsWith: optional(string),
  regex: optional(string),
  innerRegex: optional(string),
};

type StringValidation = Record<number | symbol, never> &
  NarrowestInput<typeof specStringValidation>;

function checkNumberValidation(
  n: number,
  validation: NumberValidation
): number {
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
  if (validation.length !== undefined) {
    if (typeof validation.length === "number") {
      if (s.length !== validation.length) {
        throw new Error("String length does not equal expected value");
      }
    } else {
      try {
        validateInteger(s.length, validation.length);
      } catch (e) {
        if (e instanceof Error) {
          // Hack: produce a more descriptive error message when string length is incorrect
          throw new Error(e.message.replace("Number", "String length"));
        }
        throw e;
      }
    }
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

export {
  integer,
  specNumberValidation,
  NumberValidation,
  specStringValidation,
  StringValidation,
  validateNumber,
  numberValidatedBy,
  validateInteger,
  integerValidatedBy,
  validateString,
  stringValidatedBy,
};
