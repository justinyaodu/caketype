import { assertPredicate } from "./predicate";

const booleanPositive = (x: number) => x > 0;

test("assertion passes when predicate returns true", () => {
  assertPredicate(booleanPositive, 5);
});

test("assertion fails when predicate returns false", () => {
  expect(() => assertPredicate(booleanPositive, -5)).toThrow();
});

function stringPositive(x: number) {
  if (x <= 0) {
    return "not positive";
  }
}

test("assertion passes when predicate does not return anything", () => {
  assertPredicate(stringPositive, 5);
});

test("assertion fails when predicate returns a string", () => {
  expect(() => assertPredicate(stringPositive, -5)).toThrow();
})
