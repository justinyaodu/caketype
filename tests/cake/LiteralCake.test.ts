import { bake, LiteralNotEqualCakeError } from "../../src";

const cake = bake(null);

test("toString", () => {
  expect(cake.toString()).toStrictEqual("null");
});

test("success", () => {
  expect(cake.is(null)).toStrictEqual(true);
});

test("error", () => {
  const result = cake.check("oops");
  if (result.ok) {
    fail();
  } else {
    expect(result.error).toStrictEqual(
      new LiteralNotEqualCakeError(cake, "oops")
    );
    expect(result.error.toString()).toStrictEqual("Value does not equal null.");
  }
});
