import { omit, pick } from "./object";

test("pick fields from object", () => {
  expect(pick({ age: 3, admin: false }, "admin")).toEqual({ admin: false });
});

test("pick no fields", () => {
  expect(pick({ age: 3, admin: false })).toEqual({});
});

test("omit fields from object", () => {
  expect(omit({ age: 3, admin: false }, "admin")).toEqual({ age: 3 });
});

test("omit no fields", () => {
  expect(omit({ age: 3, admin: false })).toEqual({ age: 3, admin: false });
});
