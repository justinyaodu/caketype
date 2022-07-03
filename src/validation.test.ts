import {
  integer,
  integerValidatedBy,
  numberValidatedBy,
  stringValidatedBy,
  validateNumber,
  validateString,
} from "./validation";

test("integer and integerValidatedBy without any validations", () => {
  for (const transform of [integer, integerValidatedBy({})]) {
    expect(transform(7)).toEqual(7);
    expect(() => transform(3.14)).toThrow();
    expect(() => transform(NaN)).toThrow();
    expect(() => transform(Infinity)).toThrow();
    expect(() => transform("oops")).toThrow();
  }
});

test("numberValidatedBy without any validations", () => {
  const transform = numberValidatedBy({});
  expect(transform(2.75)).toEqual(2.75);
  expect(() => transform("hi")).toThrow();
});

test("numberValidatedBy with all validations", () => {
  const transform = numberValidatedBy({
    finite: true,
    min: 3,
    max: 7,
    step: 0.5,
  });
  expect(transform(3)).toEqual(3);
  expect(transform(7)).toEqual(7);
  expect(transform(4.5)).toEqual(4.5);
  expect(() => transform(NaN)).toThrow();
  expect(() => transform(Infinity)).toThrow();
  expect(() => transform(1)).toThrow();
  expect(() => transform(7.5)).toThrow();
  expect(() => transform(4.1)).toThrow();
});

test("stringValidatedBy without any validations", () => {
  const transform = stringValidatedBy({});
  expect(transform("")).toEqual("");
  expect(transform("hi")).toEqual("hi");
  expect(() => transform(false)).toThrow();
});

test("stringValidatedBy with all validations", () => {
  const transform = stringValidatedBy({
    length: 7,
    startsWith: "a(",
    endsWith: ")a",
    regex: "..[ab]+..",
    innerRegex: "[bc]+",
  });

  expect(transform("a(bbb)a")).toEqual("a(bbb)a");
  expect(() => transform("(bbbb)")).toThrow();
  expect(() => transform("a bbb)a")).toThrow();
  expect(() => transform("a(bbb a")).toThrow();
  expect(() => transform("a(bcb)a")).toThrow();
  expect(() => transform("a(bab)a")).toThrow();
});

test("stringValidatedBy with number validation for length", () => {
  const transform = stringValidatedBy({
    length: {
      min: 3,
      max: 7,
    },
  });

  expect(transform("123")).toEqual("123");
  expect(() => transform("12")).toThrow();
});

test("swapping arguments of validateNumber and validateString produces type errors", () => {
  () => {
    // @ts-expect-error
    validateNumber({}, 3);
    // @ts-expect-error
    validateString({}, "hi");
  };
});
