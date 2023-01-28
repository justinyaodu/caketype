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
  });

  expect(Person.is({ name: "Alice" })).toStrictEqual(true);
});

test("array", () => {
  const Numbers = array(number);

  expect(Numbers.is([2, 3])).toStrictEqual(true);
  expect(Numbers.is([])).toStrictEqual(true);
});

test("union", () => {
  type NullableString = string | null;

  const NullableString = union(string, null);
  type _ = Assert<Equivalent<NullableString, Infer<typeof NullableString>>>;

  expect(NullableString.is("hello")).toStrictEqual(true);
  expect(NullableString.is(null)).toStrictEqual(true);
});

test("literal", () => {
  const Color = union("red", "green", "blue");

  const Operation = union(
    {
      operation: "get",
      id: string,
    } as const,
    {
      operation: "set",
      id: string,
      value: number,
    } as const
  );

  type _ = [
    Assert<Equivalent<Infer<typeof Color>, "red" | "green" | "blue">>,
    Assert<
      Equivalent<
        Infer<typeof Operation>,
        | { operation: "get"; id: string }
        | { operation: "set"; id: string; value: number }
      >
    >
  ];
});
