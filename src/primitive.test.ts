import { isPrimitive, reprPrimitive } from "./primitive";

test("bigint is primitive", () => {
  expect(isPrimitive(BigInt(200))).toBe(true);
});

test("boolean is primitive", () => {
  expect(isPrimitive(true)).toBe(true);
});

test("number is primitive", () => {
  expect(isPrimitive(3.14)).toBe(true);
});

test("string is primitive", () => {
  expect(isPrimitive("apple")).toBe(true);
});

test("symbol is primitive", () => {
  expect(isPrimitive(Symbol.iterator)).toBe(true);
});

test("null is primitive", () => {
  expect(isPrimitive(null)).toBe(true);
});

test("array is not primitive", () => {
  expect(isPrimitive([])).toBe(false);
});

test("object is not primitive", () => {
  expect(isPrimitive({})).toBe(false);
});

test("undefined is not primitive", () => {
  expect(isPrimitive(undefined)).toBe(false);
});

test("repr bigint", () => {
  expect(reprPrimitive(BigInt(-27))).toEqual("-27n");
});

test("repr boolean", () => {
  expect(reprPrimitive(false)).toEqual("false");
})

test("repr number", () => {
  expect(reprPrimitive(3.75)).toEqual("3.75");
});

test("repr -Infinity", () => {
  expect(reprPrimitive(-Infinity)).toEqual("-Infinity");
});

test("repr string", () => {
  expect(reprPrimitive("hi\n\t\"")).toEqual("\"hi\\n\\t\\\"\"");
});

test("repr symbol", () => {
  expect(reprPrimitive(Symbol("foo"))).toEqual("Symbol(foo)");
});

test("repr null", () => {
  expect(reprPrimitive(null)).toEqual("null");
});
