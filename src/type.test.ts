import { transform } from "./transform";
import { boolean, number, placeholder, remove, string, unknown } from "./type";

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

test("placeholder", () => {
  const spec = {
    stuff: placeholder,
  };
  expect(() => transform({ stuff: 5 }, spec)).toThrow();
  spec.stuff = 5;
  expect(transform({ stuff: 5 }, spec)).toEqual({ stuff: 5 });
});

test("remove", () => {
  expect(remove(5)).toEqual(undefined);
});

test("unknown", () => {
  expect(unknown(undefined)).toEqual(undefined);
  expect(unknown([27, "hi", false])).toEqual([27, "hi", false]);
})
