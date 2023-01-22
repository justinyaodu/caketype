import { bake, string } from "../../src";
import { expectTypeError } from "../test-helpers";

describe("documentation examples", () => {
  const cake = bake({ name: string } as const);
  const error = cake.checkShape({}).errorOr(null);
  if (error === null) {
    fail();
  }

  test("throw", () => {
    expectTypeError(
      () => error.throw(),
      [
        `Value does not satisfy type '{name: string}': object properties are invalid.`,
        `  Property "name": Required property is missing.`,
      ].join("\n")
    );
  });

  test("toString", () => {
    expect(error.toString()).toStrictEqual(
      [
        `Value does not satisfy type '{name: string}': object properties are invalid.`,
        `  Property "name": Required property is missing.`,
      ].join("\n")
    );
  });
});
