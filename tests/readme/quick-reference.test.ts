import {
  array,
  Assert,
  bake,
  Equivalent,
  Infer,
  number,
  optional,
  string,
  union,
} from "../../src";

test("built-in type", () => {
  expect(number.is(7)).toStrictEqual(true);
});

test("object type", () => {
  const Person = bake({
    name: string,
    age: optional(number),
  } as const);

  expect(Person.is({ name: "Alice" })).toStrictEqual(true);
});

test("array", () => {
  const Numbers = array(number);

  expect(Numbers.is([2, 3])).toStrictEqual(true);
});

test("union", () => {
  type NullableString = string | null;

  const NullableString = union(string, null);
  type _ = Assert<Equivalent<NullableString, Infer<typeof NullableString>>>;

  expect(NullableString.is("hello")).toStrictEqual(true);
  expect(NullableString.is(null)).toStrictEqual(true);
});
