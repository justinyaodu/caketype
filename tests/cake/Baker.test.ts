import {
  Assert,
  bake,
  Cake,
  Equivalent,
  Infer,
  number,
  ObjectCake,
  optional,
  OptionalTag,
  string,
} from "../../src";

describe("documentation examples", () => {
  test("bake", () => {
    const Person = bake({
      name: string,
      age: optional(number),
    });
    type _1 = Assert<
      Equivalent<
        typeof Person,
        ObjectCake<{
          name: Cake<string>;
          age: OptionalTag<Cake<number>>;
        }>
      >
    >;

    expect(Person.is({ name: "Alice" })).toStrictEqual(true);

    type Person = Infer<typeof Person>;
    type _2 = Assert<
      Equivalent<Person, { name: string; age?: number | undefined }>
    >;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bob: Person = { name: "Bob", age: 42 };
  });
});
