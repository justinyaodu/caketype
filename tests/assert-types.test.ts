import { Assert, Extends, Equivalent, If, Not, AssertExtends } from "../src";

describe("documentation examples", () => {
  test("Assert", () => {
    type _pass = Assert<Equivalent<string["length"], number>>;

    // @ts-expect-error
    type _fail = Assert<Equivalent<string, number>>;
  });

  test("AssertExtends", () => {
    type _pass = AssertExtends<3, number>;

    // @ts-expect-error
    type _fail = AssertExtends<number, 3>;
  });

  test("Equivalent", () => {
    type _true = Equivalent<string["length"], number>;
    type _false = Equivalent<3, number>;

    type _ = Assert<Equivalent<[_true, _false], [true, false]>>;
  });

  test("Extends", () => {
    type _ = Assert<Not<Extends<number, 3>>>;
  });

  test("If", () => {
    type _apple = Assert<Equivalent<If<true, "apple", "banana">, "apple">>;
    type _either = Assert<
      Equivalent<If<true | false, "apple", "banana">, "apple" | "banana">
    >;
  });

  test("Not", () => {
    type _false = Not<true>;
    type _boolean = Not<boolean>;

    type _ = Assert<Equivalent<[_false, _boolean], [false, boolean]>>;
  });
});

test("Assert", () => {
  type _ = [
    Assert<true>,

    // @ts-expect-error
    Assert<false>,

    // @ts-expect-error
    Assert<boolean>
  ];
});

test("Equivalent", () => {
  type _ = [
    Assert<Equivalent<boolean, boolean>>,

    // @ts-expect-error
    Assert<Equivalent<boolean, true>>,

    // @ts-expect-error
    Assert<Equivalent<true, boolean>>,

    // @ts-expect-error
    Assert<Equivalent<true, false>>
  ];
});

test("If", () => {
  type _ = [
    Assert<Equivalent<If<false, 1, 0>, 0>>,
    Assert<Equivalent<If<true, 1, 0>, 1>>,
    Assert<Equivalent<If<boolean, 1, 0>, 1 | 0>>
  ];
});

test("Not", () => {
  type _ = [
    Assert<Equivalent<Not<false>, true>>,
    Assert<Equivalent<Not<true>, false>>,
    Assert<Equivalent<Not<boolean>, boolean>>
  ];
});

test("Extends", () => {
  type _ = [
    Assert<Extends<true, boolean>>,
    Assert<Not<Extends<boolean, true>>>
  ];
});

test("AssertExtends", () => {
  type _pass = AssertExtends<3, number>;

  // @ts-expect-error
  type _fail = AssertExtends<number, 3>;

  type _ = [
    AssertExtends<true, boolean>,

    // @ts-expect-error
    AssertExtends<boolean, true>
  ];
});
