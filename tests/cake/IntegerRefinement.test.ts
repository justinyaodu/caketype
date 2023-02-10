import { integer } from "../../src";
import { expectTypeError } from "../test-helpers";

describe("documentation examples", () => {
  test("integer", () => {
    expect(integer.is(5)).toStrictEqual(true);
    expect(integer.is(5.5)).toStrictEqual(false);
  });
});

test("not integer error message", () => {
  expectTypeError(() => integer.as(5.5), "Number is not an integer.");
});

test("wrong type", () => {
  expect(integer.is("oops")).toStrictEqual(false);
});

test("stringify when name removed", () => {
  expect(integer.withName(null).toString()).toStrictEqual(
    "(number).refined(is an integer)"
  );
});
