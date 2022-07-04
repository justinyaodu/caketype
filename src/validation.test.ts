import {
  arrayOf,
  booleanValidatedBy,
  integer,
  integerValidatedBy,
  numberValidatedBy,
  stringValidatedBy,
  validateNumber,
  validateString,
} from "./validation";

test("arrayOf without length validation", () => {
  const transform = arrayOf(integer);
  expect(transform([])).toStrictEqual([]);
  expect(transform([2, 7])).toStrictEqual([2, 7]);
  expect(() => transform(3)).toThrow();
  expect(() => transform(["oops"])).toThrow();
});

test("arrayOf with length validation", () => {
  for (const transform of [
    arrayOf(integer, 3),
    arrayOf(integer, { length: 3 }),
    arrayOf(integer, { length: { equals: 3 } }),
  ]) {
    expect(transform([1, 2, 3])).toStrictEqual([1, 2, 3]);
    expect(() => transform([1, 2])).toThrow();
  }
});

test("booleanValidatedBy", () => {
  const anyBoolean = booleanValidatedBy({});
  expect(anyBoolean(false)).toBe(false);
  expect(anyBoolean(true)).toBe(true);
  expect(() => anyBoolean(null)).toThrow();

  const onlyFalse = booleanValidatedBy({ equals: false });
  expect(onlyFalse(false)).toBe(false);
  expect(() => onlyFalse(true)).toThrow();

  const onlyTrue = booleanValidatedBy({ equals: true });
  expect(onlyTrue(true)).toBe(true);
  expect(() => onlyTrue(false)).toThrow();
});

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

test("numberValidatedBy with all validations except equals", () => {
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

test("numberValidatedBy with equals", () => {
  const only3 = numberValidatedBy({ equals: 3 });
  expect(only3(3)).toEqual(3);
  expect(() => only3(NaN)).toThrow();

  const onlyNaN = numberValidatedBy({ equals: NaN });
  expect(Number.isNaN(onlyNaN(NaN))).toBe(true);
  expect(() => onlyNaN(3)).toThrow();
});

test("numberValidatedBy with finite = false", () => {
  const nonFinite = numberValidatedBy({ finite: false });
  expect(Number.isNaN(nonFinite(NaN))).toBe(true);
  expect(nonFinite(-Infinity)).toEqual(-Infinity);
  expect(() => nonFinite(0)).toThrow();
});

test("stringValidatedBy without any validations", () => {
  const transform = stringValidatedBy({});
  expect(transform("")).toEqual("");
  expect(transform("hi")).toEqual("hi");
  expect(() => transform(false)).toThrow();
});

test("stringValidatedBy with all validations except equals", () => {
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

test("stringValidatedBy with innerRegex, startsWith, and endsWith", () => {
  const onlyInner = stringValidatedBy({ innerRegex: "a.c" });
  expect(onlyInner("abc")).toEqual("abc");
  expect(() => onlyInner("abb")).toThrow();

  const prefixAndInner = stringValidatedBy({
    startsWith: "<<",
    innerRegex: "a.c",
  });
  expect(prefixAndInner("<<azc")).toEqual("<<azc");
  expect(() => prefixAndInner("<<azzc")).toThrow();

  const suffixAndInner = stringValidatedBy({
    innerRegex: "a.c",
    endsWith: ">>",
  });
  expect(suffixAndInner("azc>>")).toEqual("azc>>");
  expect(() => suffixAndInner("ac>>")).toThrow();
});

test("stringValidatedBy with equals", () => {
  const transform = stringValidatedBy({ equals: "hi" });
  expect(transform("hi")).toEqual("hi");
  expect(() => transform("bye")).toThrow();
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
