import { number } from "../../src";
import { expectTypeError } from "../test-helpers";

describe("documentation examples", () => {
  test("number", () => {
    expect(number.is(5)).toStrictEqual(true);
    expect(number.is("5")).toStrictEqual(false);
  });

  test("number NaN", () => {
    expect(number.is(NaN)).toStrictEqual(false);
    expectTypeError(() => number.as(NaN), "Value is NaN.");
  });
});
