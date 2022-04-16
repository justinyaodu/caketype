import { union } from "./combinator";
import { Transform } from "./transform";
import { boolean, string } from "./type";
import { Assert, Equivalent } from "./type-assert";

test("union of boolean and string", () => {
  const booleanOrString = union(boolean, string);
  type _ = Assert<
    Equivalent<
      typeof booleanOrString,
      Transform<unknown, string | boolean, string | boolean>
    >
  >;
  expect(booleanOrString(false)).toBe(false);
  expect(booleanOrString("apple")).toEqual("apple");
  expect(() => booleanOrString(7)).toThrow();
});

test("union of constant and function", () => {
  const subtractUnlessZero = union(0, (x: number) => x - 1);
  type _ = Assert<
    Equivalent<typeof subtractUnlessZero, Transform<number, number, number>>
  >;
  expect(subtractUnlessZero(0)).toEqual(0);
  expect(subtractUnlessZero(5)).toEqual(4);
});
