import { boolean, number, string } from "./type";

test("call boolean with boolean: should succeed", () => {
  expect(boolean(false)).toBe(false);
});

test("call boolean with non-boolean: should fail", () => {
  expect(() => boolean("hi")).toThrow();
});

test("call number with number: should succeed", () => {
  expect(number(3)).toEqual(3);
});

test("call number with non-number: should fail", () => {
  expect(() => number("hi")).toThrow();
});

test("call string with string: should succeed", () => {
  expect(string("hi")).toEqual("hi");
});

test("call string with non-string: should fail", () => {
  expect(() => string(3)).toThrow();
});
