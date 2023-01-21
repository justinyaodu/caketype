import { array, bake, number, optional, string } from "../../src";

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
