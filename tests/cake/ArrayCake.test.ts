import { array, number } from "../../src";

describe("documentation examples", () => {
  test("array", () => {
    const nums = array(number);

    expect(nums.is([2, 3])).toStrictEqual(true);
    expect(nums.is([])).toStrictEqual(true);

    expect(nums.is(["oops"])).toStrictEqual(false);
    expect(nums.is({})).toStrictEqual(false);
  });
});
