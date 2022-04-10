import { transform } from "./transform";

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

test("transform empty tuple to empty tuple: should succeed", () => {
  expect(transform([], [])).toEqual([]);
})

test("transform non-empty tuple to empty tuple: should fail", () => {
  expect(() => transform([3], [])).toThrow();
})

test("transform tuple to equal tuple: should succeed", () => {
  expect(transform([3, false], [3, false])).toEqual([3, false]);
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
  expect(transform({}, {})).toEqual({});
});

test("transform object to equal object: should succeed", () => {
  expect(transform({ age: 3, happy: true }, { age: 3, happy: true })).toEqual({ age: 3, happy: true });
});

test("transform object to equal object with different key order: should succeed", () => {
  expect(transform({ happy: true, age: 3 }, { age: 3, happy: true })).toEqual({ age: 3, happy: true });
});

test("transform object with wrong value: should fail", () => {
  expect(() => transform({ age: 3, happy: false }, { age: 3, happy: true })).toThrow();
});

test("transform object with missing key: should fail", () => {
  expect(() => transform({ age: 3 }, { age: 3, happy: true })).toThrow();
});

test("transform object with extra key: should fail", () => {
  expect(() => transform({ age: 3, happy: true, extra: "spicy" }, { age: 3, happy: true })).toThrow();
});

function excitedTransform(input: unknown) {
  if (typeof input === "string") {
    return input + "!";
  }
  throw new Error("oops");
}

test("transform function: succeeds when function returns", () => {
  expect(transform("hi", excitedTransform)).toEqual("hi!");
})

test("transform function: fails when function throws", () => {
  expect(() => transform(7, excitedTransform)).toThrow();
})

