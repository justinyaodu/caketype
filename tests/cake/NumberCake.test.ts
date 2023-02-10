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

  test("satisfying", () => {
    const Percentage = number.satisfying({ min: 0, max: 100 });
    expect(Percentage.as(20.3)).toStrictEqual(20.3);
    expectTypeError(
      () => Percentage.as(-1),
      "Number is less than the minimum of 0."
    );
    expectTypeError(
      () => Percentage.as(101),
      "Number is greater than the maximum of 100."
    );

    expect(Percentage.as(0)).toStrictEqual(0);
    expect(Percentage.as(100)).toStrictEqual(100);

    const Even = number.satisfying({ step: 2 });
    expect(Even.as(-4)).toStrictEqual(-4);
    expectTypeError(() => Even.as(7), "Number is not a multiple of 2.");

    const Odd = number.satisfying({ step: 2, stepFrom: 1 });
    expect(Odd.as(7)).toStrictEqual(7);
    expectTypeError(() => Odd.as(-4), "Number is not 1 plus a multiple of 2.");

    // Extra toString tests.

    expect(Percentage.toString()).toStrictEqual(
      "(number).refined(min 0, max 100)"
    );
    expect(Even.toString()).toStrictEqual("(number).refined(multiple of 2)");
    expect(Odd.toString()).toStrictEqual(
      "(number).refined(1 plus a multiple of 2)"
    );
  });
});
