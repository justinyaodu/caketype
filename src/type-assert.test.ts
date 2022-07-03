import { Assert, AssertAll, Equivalent, Not } from "./type-assert";

test("Assert", () => {
  type _ = [
    Assert<true>,
    // @ts-expect-error
    Assert<false>,
    // @ts-expect-error
    Assert<7>
  ];
});

test("AssertAll", () => {
  type _ = [
    AssertAll<[]>,
    AssertAll<[true]>,
    AssertAll<[true, true]>,
    // @ts-expect-error
    AssertAll<[false]>,
    // @ts-expect-error
    AssertAll<[true, false]>,
    // @ts-expect-error
    AssertAll<[false, true, true]>,
    // @ts-expect-error
    AssertAll<true>
  ];
});

test("Not", () => {
  const _1: Not<false> = true;
  const _2: Not<true> = false;
  // @ts-expect-error
  type _ = Not<"oops">;
});

test("Equivalent", () => {
  type _ = AssertAll<
    [
      Equivalent<number, number>,
      Not<Equivalent<number, boolean>>,
      Equivalent<"a" | "b", "b" | "a">,
      Not<Equivalent<"a", "a" | "b">>,
      Not<Equivalent<"a" | "b", "b">>,
      Not<Equivalent<false, boolean>>,
      Equivalent<{ a: number } & { b: boolean }, { a: number; b: boolean }>
    ]
  >;
});
