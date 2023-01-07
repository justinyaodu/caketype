import { sameValueZero } from "../src";

test("documentation examples", () => {
  expect(sameValueZero(3, 3)).toStrictEqual(true);
  expect(sameValueZero(0, false)).toStrictEqual(false);
  expect(sameValueZero(0, -0)).toStrictEqual(true);
  expect(sameValueZero(NaN, NaN)).toStrictEqual(true);
});
