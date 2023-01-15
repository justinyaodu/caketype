import type { Assert, AssertExtends, Extends, Not, Class } from "../src";

test("documentation examples", () => {
  const _a: Class[] = [Date, Array, RegExp];
  const _b: Class<Date> = Date;
  const _c: Class<Date, [number]> = Date;
});

test("Class", () => {
  class BoolWrapper {
    constructor(public readonly value: boolean) {}
  }

  type _ = [
    AssertExtends<typeof BoolWrapper, Class>,
    AssertExtends<typeof BoolWrapper, Class<BoolWrapper>>,
    AssertExtends<typeof BoolWrapper, Class<BoolWrapper, [boolean]>>,
    Assert<Not<Extends<typeof BoolWrapper, Class<BoolWrapper, [number]>>>>,
    Assert<Not<Extends<typeof BoolWrapper, Class<BoolWrapper, []>>>>,
    // Extra arguments are okay, similar to functions.
    AssertExtends<typeof BoolWrapper, Class<BoolWrapper, [boolean, number]>>,

    AssertExtends<typeof Date | typeof RegExp, Class<Date | RegExp>>,
    Assert<Not<Extends<Date, Class>>>,
    Assert<Not<Extends<() => Date, Class>>>,
    Assert<Not<Extends<typeof Symbol, Class>>>
  ];
});
