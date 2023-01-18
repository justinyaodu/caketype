import {
  Assert,
  bake,
  CakeError,
  Equivalent,
  Infer,
  number,
  ObjectPropertiesCakeError,
  optional,
  Result,
  string,
} from "../../src";
import { ObjectExcessPropertyCakeError } from "../../src/cake/ObjectCake";
import { expectTypeError, typeCheckOnly } from "../test-helpers";

describe("documentation examples", () => {
  test("as", () => {
    expect(number.as(3)).toStrictEqual(3);

    expectTypeError(
      () => number.as("oops"),
      "Value does not satisfy type 'number': type guard failed."
    );
  });

  test("asStrict", () => {
    const Person = bake({ name: string } as const);
    const alice = { name: "Alice", extra: "oops" };

    expect(Person.as(alice)).toStrictEqual({ name: "Alice", extra: "oops" });

    expectTypeError(
      () => Person.asStrict(alice),
      [
        `Value does not satisfy type '{name: string}': object properties are invalid.`,
        `  Property "extra": Property is not declared in type and excess properties are not allowed.`,
      ].join("\n")
    );

    // Extra test for the successful case:
    const bob = { name: "Bob" };
    expect(Person.asStrict(bob)).toStrictEqual(bob);
  });

  test("check", () => {
    function square(input: unknown) {
      const result = number.check(input);
      if (result.ok) {
        const _: number = result.value;
        return result.value ** 2;
      } else {
        const _: CakeError = result.error;
        return result.error.toString();
      }
    }

    expect(square(3)).toStrictEqual(9);

    expect(square("oops")).toStrictEqual(
      "Value does not satisfy type 'number': type guard failed."
    );
  });

  test("checkStrict", () => {
    const Person = bake({ name: string } as const);
    const alice = { name: "Alice", extra: "oops" };
    expect(Person.check(alice)).toStrictEqual(Result.ok(alice));
    expect(Person.checkStrict(alice)).toStrictEqual(
      Result.err(
        new ObjectPropertiesCakeError(Person, alice, {
          extra: new ObjectExcessPropertyCakeError("oops"),
        })
      )
    );
  });

  test("check and Result.valueOr", () => {
    expect(number.check(3).valueOr(0)).toStrictEqual(3);
    expect(number.check("oops").valueOr(0)).toStrictEqual(0);
  });

  test("check and Result.errorOr", () => {
    expect(number.check(3).errorOr(null)).toStrictEqual(null);
    expect(number.check("oops").errorOr(null)).toBeInstanceOf(CakeError);
  });

  test("is returns boolean", () => {
    expect(number.is(3)).toStrictEqual(true);
    expect(number.is("oops")).toStrictEqual(false);
  });

  test(
    "is type guard",
    typeCheckOnly(() => {
      const value: unknown = 7;
      if (number.is(value)) {
        const _: number = value;
      }
    })
  );

  test("isStrict", () => {
    const Person = bake({ name: string } as const);
    const alice = { name: "Alice", extra: "oops" };
    expect(Person.is(alice)).toStrictEqual(true);
    expect(Person.isStrict(alice)).toStrictEqual(false);
  });

  test("toString", () => {
    const Person = bake({
      name: string,
      age: optional(number),
    } as const);

    expect(Person.toString()).toStrictEqual(
      "{name: string, age?: (number) | undefined}"
    );
  });

  test(
    "Infer",
    typeCheckOnly(() => {
      const Person = bake({
        name: string,
        age: optional(number),
      } as const);

      type Person = Infer<typeof Person>;
      type _ = Assert<
        Equivalent<Person, { name: string; age?: number | undefined }>
      >;
    })
  );
});
