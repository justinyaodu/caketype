import { integer, string } from "../../src";
import { expectTypeError } from "../test-helpers";

describe("documentation examples", () => {
  test("string", () => {
    expect(string.is("hello")).toStrictEqual(true);
    expect(string.is("")).toStrictEqual(true);
  });

  test("satisfying", () => {
    const NonEmptyString = string.satisfying({ length: { min: 1 } });

    expect(NonEmptyString.as("hello")).toStrictEqual("hello");

    expectTypeError(
      () => NonEmptyString.as(""),
      "String length is invalid: Number is less than the minimum of 1."
    );

    const HexString = string.satisfying({ regex: /^[0-9a-f]+$/ });

    expect(HexString.as("123abc")).toStrictEqual("123abc");

    expectTypeError(
      () => HexString.as("oops"),
      "String does not match regex /^[0-9a-f]+$/."
    );

    // Test toString

    expect(NonEmptyString.toString()).toStrictEqual(
      "(string).refined(length min 1)"
    );
    expect(HexString.toString()).toStrictEqual(
      "(string).refined(regex /^[0-9a-f]+$/)"
    );
  });
});

test("length constant", () => {
  const FiveCharacterString = string.satisfying({ length: 5 });
  expect(FiveCharacterString.is("hello")).toStrictEqual(true);
  expectTypeError(
    () => FiveCharacterString.as("oops"),
    "String length is invalid: Value does not equal 5."
  );
});

test("length Cake", () => {
  const EvenLengthString = string.satisfying({
    length: integer.satisfying({ step: 2 }),
  });

  expect(EvenLengthString.is("hi")).toStrictEqual(true);
  expectTypeError(
    () => EvenLengthString.as("hello"),
    "String length is invalid: Number is not a multiple of 2."
  );
});
