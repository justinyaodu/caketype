import {
  boolean,
  number,
  placeholder,
  remove,
  string,
  unknown,
} from "./terminals";
import { transform } from "./transform";

test("boolean", () => {
  expect(boolean(false)).toBe(false);
  expect(() => boolean("hi")).toThrow();
});

test("number", () => {
  expect(number(3)).toEqual(3);
  expect(() => number("hi")).toThrow();
});

test("string", () => {
  expect(string("hi")).toEqual("hi");
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
});
