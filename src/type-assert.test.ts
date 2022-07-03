import { Assert, Equivalent, Not } from "./type-assert";

test("Assert", () => {
  type _ = [
    Assert<true>,
    // @ts-expect-error
    Assert<false>,
    // @ts-expect-error
    Assert<7>
  ];
});

test("Not", () => {
  const _1: Not<false> = true;
  const _2: Not<true> = false;
  // @ts-expect-error
  type _ = Not<"oops">;
});

test("Equivalent", () => {
  type _ = [
    Assert<Equivalent<number, number>>,
    Assert<Not<Equivalent<number, boolean>>>,
    Assert<Equivalent<"a" | "b", "b" | "a">>,
    Assert<Not<Equivalent<"a", "a" | "b">>>,
    Assert<Not<Equivalent<"a" | "b", "b">>>,
    Assert<Not<Equivalent<false, boolean>>>,
    Assert<
      Equivalent<{ a: number } & { b: boolean }, { a: number; b: boolean }>
    >
  ];
});
