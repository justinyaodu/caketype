import {
  Assert,
  bake,
  Equivalent,
  Infer,
  number,
  ObjectCake,
  optional,
  OptionalTag,
  string,
  TypePredicateCake,
} from "../../src";

describe("documentation examples", () => {
  test("bake", () => {
    const Person = bake({
      name: string,
      age: optional(number),
    } as const);
    type _1 = Assert<
      Equivalent<
        typeof Person,
        ObjectCake<{
          name: TypePredicateCake<string>;
          age: OptionalTag<TypePredicateCake<number>>;
        }>
      >
    >;

    const aliceIsPerson = Person.is({ name: "Alice" });
    expect(aliceIsPerson).toStrictEqual(true);

    type Person = Infer<typeof Person>;
    type _2 = Assert<
      Equivalent<Person, { name: string; age?: number | undefined }>
    >;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bob: Person = { name: "Bob", age: 42 };
  });
});
