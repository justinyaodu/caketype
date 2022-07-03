import {
  compile,
  narrow,
  narrowAndWide,
  Transform,
  transform,
} from "./transform";
import { Assert, Equivalent } from "./type-assert";

test("transform non-primitive to primitive: should fail", () => {
  expect(() => transform(undefined, 3)).toThrow();
});

test("transform primitive to equal primitive: should succeed", () => {
  expect(transform(3, 3)).toEqual(3);
});

test("transform primitive to non-equal primitive: should fail", () => {
  expect(() => transform("hi", "bye")).toThrow();
});

test("transform non-array to tuple: should fail", () => {
  expect(() => transform("oops", [3, false])).toThrow();
});

test("transform object to tuple: should fail", () => {
  expect(() => transform({}, [])).toThrow();
});

test("transform empty tuple to empty tuple: should succeed", () => {
  expect(transform([], [])).toStrictEqual([]);
});

test("transform non-empty tuple to empty tuple: should fail", () => {
  expect(() => transform([3], [])).toThrow();
});

test("transform tuple to equal tuple: should succeed", () => {
  expect(transform([3, false], [3, false])).toStrictEqual([3, false]);
});

test("transform tuple with wrong length: should fail", () => {
  expect(() => transform([3], [3, false])).toThrow();
});

test("transform tuple with different elements: should fail", () => {
  expect(() => transform([3, "oops"], [3, false])).toThrow();
});

test("transform array to object: should fail", () => {
  expect(() => transform([], {})).toThrow();
});

test("transform primitive to object: should fail", () => {
  expect(() => transform(false, {})).toThrow();
});

test("transform empty object to empty object: should succeed", () => {
  expect(transform({}, {})).toStrictEqual({});
});

test("transform object to equal object: should succeed", () => {
  expect(
    transform({ age: 3, happy: true }, { age: 3, happy: true })
  ).toStrictEqual({
    age: 3,
    happy: true,
  });
});

test("transform object to equal object with different key order: should succeed", () => {
  expect(
    transform({ happy: true, age: 3 }, { age: 3, happy: true })
  ).toStrictEqual({
    age: 3,
    happy: true,
  });
});

test("transform object with wrong value: should fail", () => {
  expect(() =>
    transform({ age: 3, happy: false }, { age: 3, happy: true })
  ).toThrow();
});

test("transform object with missing key: should fail", () => {
  expect(() => transform({ age: 3 }, { age: 3, happy: true })).toThrow();
});

test("transform object with extra key: should fail", () => {
  expect(() =>
    transform({ age: 3, happy: true, extra: "spicy" }, { age: 3, happy: true })
  ).toThrow();
});

test("transform object with function that returns undefined", () => {
  expect(
    transform({ x: 5, y: 2 }, { x: (_input: unknown) => undefined, y: 2 })
  ).toStrictEqual({ y: 2 });
});

function excitedTransform(input: unknown) {
  if (typeof input === "string") {
    return input + "!";
  }
  throw new Error("oops");
}

test("transform function: succeeds when function returns", () => {
  expect(transform("hi", excitedTransform)).toEqual("hi!");
});

test("transform function: fails when function throws", () => {
  expect(() => transform(7, excitedTransform)).toThrow();
});

test("compile function", () => {
  const compiled = compile((x: number) => x > 0);
  type _ = Assert<Equivalent<typeof compiled, Transform<number, boolean>>>;
  expect(compiled(5)).toBe(true);
  expect(compiled(-2)).toBe(false);
});

test("compile object spec", () => {
  const compiled = compile({ age: 3, happy: true } as const);
  type _ = Assert<
    Equivalent<
      typeof compiled,
      Transform<unknown, { age: 3; happy: true }, { age: 3; happy: true }>
    >
  >;
  expect(compiled({ age: 3, happy: true })).toEqual({ age: 3, happy: true });
  expect(() => compiled(null)).toThrow();
});

test("narrow primitive", () => {
  const exactString = narrow("exactly this string");
  type _ = Assert<
    Equivalent<
      typeof exactString,
      Transform<"exactly this string", "exactly this string">
    >
  >;
  expect(exactString("exactly this string")).toEqual("exactly this string");
  // Can't test any other inputs without causing a type error.
});

test("narrow and wide", () => {
  const [narrow5, wide5] = narrowAndWide(5);
  type _ = [
    Assert<Equivalent<typeof narrow5, Transform<5, 5, 5>>>,
    Assert<Equivalent<typeof wide5, Transform<unknown, 5, 5>>>
  ];
  expect(narrow5(5)).toEqual(5);
  expect(wide5(5)).toEqual(5);
  expect(() => wide5(20)).toThrow();
  expect(() => wide5("hi")).toThrow();
});
