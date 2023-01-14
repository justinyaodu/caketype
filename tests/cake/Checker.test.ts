/* eslint-disable @typescript-eslint/no-explicit-any */

import { Checker, number, ObjectCake } from "../../src";

test("Checker caches duplicate invocations", () => {
  const checker = new Checker();
  const cake = new ObjectCake({ age: number });
  const obj = { age: "oops" };
  const error1 = checker.check(cake, obj).errorOr(null);
  const error2 = checker.check(cake, obj).errorOr(null);

  expect(error1).toBe(error2);
  expect((error1 as any).errors.name).toBe((error2 as any).errors.name);
});
