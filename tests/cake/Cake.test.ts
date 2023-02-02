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
import { ExcessPropertyPresentCakeError } from "../../src/cake/ObjectCake";
import { expectTypeError, typeCheckOnly } from "../test-helpers";

describe("documentation examples", () => {
  test("as", () => {
    expect(number.as(3)).toStrictEqual(3);

    expectTypeError(
      () => number.as("oops"),
      "Value does not satisfy type 'number'."
    );
  });

  test("asShape", () => {
    const Person = bake({ name: string });
    const alice = { name: "Alice", extra: "oops" };

    expect(Person.asShape(alice)).toStrictEqual({
      name: "Alice",
      extra: "oops",
    });

    expectTypeError(
      () => Person.as(alice),
      [
        `Value does not satisfy type '{name: string}': object properties are invalid.`,
        `  Property "extra": Property is not declared in type and excess properties are not allowed.`,
      ].join("\n")
    );

    // Extra test for the failing case:
    expectTypeError(
      () => Person.asShape("oops"),
      `Value does not satisfy type '{name: string}': value is not an object.`
    );
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
      "Value does not satisfy type 'number'."
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

  test("checkShape", () => {
    const Person = bake({ name: string });
    const alice = { name: "Alice", extra: "oops" };
    expect(Person.checkShape(alice)).toStrictEqual(Result.ok(alice));
    expect(Person.check(alice)).toStrictEqual(
      Result.err(
        new ObjectPropertiesCakeError(Person, alice, {
          extra: new ExcessPropertyPresentCakeError("oops"),
        })
      )
    );
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

  test("isShape", () => {
    const Person = bake({ name: string });
    const alice = { name: "Alice", extra: "oops" };

    expect(Person.isShape(alice)).toStrictEqual(true);
    expect(Person.is(alice)).toStrictEqual(false);
  });

  test("toString", () => {
    const Person = bake({
      name: string,
      age: optional(number),
    });

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
      });

      type Person = Infer<typeof Person>;
      type _ = Assert<
        Equivalent<Person, { name: string; age?: number | undefined }>
      >;
    })
  );
});
