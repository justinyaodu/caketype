import {
  Assert,
  AssertExtends,
  Cake,
  Equivalent,
  Infer,
  LiteralNotEqualCakeError,
  number,
  string,
  union,
  UnionCake,
  UnionCakeError,
} from "../../src";

import { testToString } from "./test-helpers";

describe("documentation examples", () => {
  test("union StringOrNumber", () => {
    const StringOrNumber = union(string, number);

    expect(StringOrNumber.is("hello")).toStrictEqual(true);
    expect(StringOrNumber.is(7)).toStrictEqual(true);
    expect(StringOrNumber.is(false)).toStrictEqual(false);
  });

  test("union Color", () => {
    const Color = union("red", "green", "blue");

    type Color = Infer<typeof Color>;
    type _ = Assert<Equivalent<Color, "red" | "green" | "blue">>;

    expect(Color.is("red")).toStrictEqual(true);
    expect(Color.is("oops")).toStrictEqual(false);
  });
});

const cakes = {
  zero: new UnionCake({ members: [] as const }),
  one: union(1),
  two: union(1, 2),
} as const;

type _ = AssertExtends<
  typeof cakes,
  {
    readonly zero: Cake<never>;
    readonly one: Cake<1>;
    readonly two: Cake<1 | 2>;
  }
>;

testToString(cakes, {
  zero: "never (empty union)",
  one: "1",
  two: "(1) | (2)",
});

test("error", () => {
  const result = cakes.two.check("oops");
  if (result.ok) {
    fail();
  } else {
    expect(result.error).toStrictEqual(
      new UnionCakeError(cakes.two, "oops", {
        0: new LiteralNotEqualCakeError(cakes.two.members[0], "oops"),
        1: new LiteralNotEqualCakeError(cakes.two.members[1], "oops"),
      })
    );
    expect(result.error.toString()).toStrictEqual(
      [
        "Value does not satisfy type '(1) | (2)': none of the union member(s) are satisfied.",
        "  Value does not equal 1.",
        "  Value does not equal 2.",
      ].join("\n")
    );
  }
});
