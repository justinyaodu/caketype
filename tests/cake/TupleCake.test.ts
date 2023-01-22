import {
  Assert,
  AssertExtends,
  bake,
  boolean,
  Cake,
  entriesUnsound,
  Equivalent,
  LiteralCake,
  optional,
  rest,
  TupleCake,
} from "../../src";
import { expectTypeError } from "../test-helpers";

import { testIs, testToString } from "./test-helpers";

function makeTuple<
  S extends readonly [] | readonly [Cake, ...Cake[]],
  O extends readonly [] | readonly [Cake, ...Cake[]],
  R extends Cake | null,
  E extends readonly [] | readonly [Cake, ...Cake[]]
>(
  startElements: S,
  optionalElements: O,
  restElement: R,
  endElements: E
): TupleCake<S, O, R, E> {
  return new TupleCake({
    startElements,
    optionalElements,
    restElement,
    endElements,
  });
}

const cakes = {
  empty: makeTuple([], [], null, []),
  one: makeTuple([bake(1)], [], null, []),
  two: makeTuple([bake(1), bake(2)], [], null, []),
  twoSplit: makeTuple([bake(1)], [], null, [bake(2)]),
  twoEnd: makeTuple([], [], null, [bake(1), bake(2)]),
  zeroOrOne: makeTuple([], [bake(1)], null, []),
  oneOrTwoOrThree: makeTuple([bake(1)], [bake(2), bake(3)], null, []),
  twos: makeTuple([], [], bake(2), []),
  oneTwos: makeTuple([bake(1)], [], bake(2), []),
  oneTwosThree: makeTuple([bake(1)], [], bake(2), [bake(3)]),
  maybeOneTwos: makeTuple([], [bake(1)], bake(2), []),
} as const;

type _ = [
  Assert<
    Equivalent<
      typeof cakes,
      Readonly<{
        empty: TupleCake<[], [], null, []>;
        one: TupleCake<[LiteralCake<1>], [], null, []>;
        two: TupleCake<[LiteralCake<1>, LiteralCake<2>], [], null, []>;
        twoSplit: TupleCake<[LiteralCake<1>], [], null, [LiteralCake<2>]>;
        twoEnd: TupleCake<[], [], null, [LiteralCake<1>, LiteralCake<2>]>;
        zeroOrOne: TupleCake<[], [LiteralCake<1>], null, []>;
        oneOrTwoOrThree: TupleCake<
          [LiteralCake<1>],
          [LiteralCake<2>, LiteralCake<3>],
          null,
          []
        >;
        twos: TupleCake<[], [], LiteralCake<2>, []>;
        oneTwos: TupleCake<[LiteralCake<1>], [], LiteralCake<2>, []>;
        oneTwosThree: TupleCake<
          [LiteralCake<1>],
          [],
          LiteralCake<2>,
          [LiteralCake<3>]
        >;
        maybeOneTwos: TupleCake<[], [LiteralCake<1>], LiteralCake<2>, []>;
      }>
    >
  >,
  AssertExtends<
    typeof cakes,
    Readonly<{
      empty: Cake<[]>;
      one: Cake<[1]>;
      two: Cake<[1, 2]>;
      twoSplit: Cake<[1, 2]>;
      twoEnd: Cake<[1, 2]>;
      zeroOrOne: Cake<[1?]>;
      oneOrTwoOrThree: Cake<[1, 2?, 3?]>;
      twos: Cake<2[]>;
      oneTwos: Cake<[1, ...2[]]>;
      oneTwosThree: Cake<[1, ...2[], 3]>;
      maybeOneTwos: Cake<[1?, ...2[]]>;
    }>
  >
];

describe("elements", () => {
  const table: Record<keyof typeof cakes, unknown> = {
    empty: [],
    one: [bake(1)],
    two: [bake(1), bake(2)],
    twoSplit: [bake(1), bake(2)],
    twoEnd: [bake(1), bake(2)],
    zeroOrOne: [optional(bake(1))],
    oneOrTwoOrThree: [bake(1), optional(bake(2)), optional(bake(3))],
    twos: [rest(bake(2))],
    oneTwos: [bake(1), rest(bake(2))],
    oneTwosThree: [bake(1), rest(bake(2)), bake(3)],
    maybeOneTwos: [optional(bake(1)), rest(bake(2))],
  };

  describe.each(entriesUnsound(table))(
    "%s.elements()",
    (cakeName, expected) => {
      expect(cakes[cakeName].elements()).toStrictEqual(expected);
    }
  );
});

testIs(cakes, [
  [[], ["empty", "zeroOrOne", "twos", "maybeOneTwos"]],
  [[1], ["one", "zeroOrOne", "oneOrTwoOrThree", "oneTwos", "maybeOneTwos"]],
  [
    [1, 2],
    ["two", "twoSplit", "twoEnd", "oneOrTwoOrThree", "oneTwos", "maybeOneTwos"],
  ],
  [
    [1, 2, 2],
    ["oneTwos", "maybeOneTwos"],
  ],
  [
    [1, 2, 3],
    ["oneOrTwoOrThree", "oneTwosThree"],
  ],
  [[1, 2, 2, 2, 3], ["oneTwosThree"]],
  [[1, 3], ["oneTwosThree"]],
  [[1, undefined], ["oneOrTwoOrThree"]],
  [[1, undefined, 3], ["oneOrTwoOrThree"]],
  [[1, "wrong"], []],
  [[2], ["twos"]],
  [[2, 1], []],
  [[2, 2], ["twos"]],
  [[2, 3], []],
  [[3], []],
  [[undefined], ["zeroOrOne", "maybeOneTwos"]],
  [[undefined, 2], ["maybeOneTwos"]],
  [["wrong", 2], []],
  ["not an array", []],
]);

testToString(cakes, {
  empty: "[]",
  one: "[1]",
  two: "[1, 2]",
  twoSplit: "[1, 2]",
  twoEnd: "[1, 2]",
  zeroOrOne: "[((1) | undefined)?]",
  oneOrTwoOrThree: "[1, ((2) | undefined)?, ((3) | undefined)?]",
  twos: "(2)[]",
  oneTwos: "[1, ...(2)[]]",
  oneTwosThree: "[1, ...(2)[], 3]",
  maybeOneTwos: "[((1) | undefined)?, ...(2)[]]",
});

test("optional elements followed by required elements", () => {
  expectTypeError(
    () =>
      new TupleCake({
        startElements: [],
        optionalElements: [boolean],
        restElement: null,
        endElements: [boolean],
      }),
    "Cannot create TupleCake with non-empty optionalElements and non-empty endElements, because required elements cannot appear after optional elements in a tuple type."
  );
});

describe("errors", () => {
  test("not an array", () => {
    expectTypeError(
      () => cakes.empty.as("oops"),
      "Value does not satisfy type '[]': value is not an array."
    );
  });

  test("exact length", () => {
    expectTypeError(
      () => cakes.empty.as([1, 2, 3]),
      "Value does not satisfy type '[]': expected 0 element(s) but received 3."
    );
  });

  test("min length", () => {
    expectTypeError(
      () => cakes.oneTwos.as([]),
      "Value does not satisfy type '[1, ...(2)[]]': expected at least 1 element(s) but received 0."
    );
  });

  test("length range", () => {
    expectTypeError(
      () => cakes.zeroOrOne.as([1, 2]),
      "Value does not satisfy type '[((1) | undefined)?]': expected 0-1 element(s) but received 2."
    );
  });

  test("tuple elements", () => {
    expectTypeError(
      () => cakes.oneTwos.as([3, 3, 3]),
      [
        "Value does not satisfy type '[1, ...(2)[]]': tuple elements are invalid.",
        "  Element 0: Value does not equal 1.",
        "  Element 1: Value does not equal 2.",
        "  Element 2: Value does not equal 2.",
      ].join("\n")
    );
  });

  test("array elements", () => {
    expectTypeError(
      () => cakes.twos.as([3]),
      [
        "Value does not satisfy type '(2)[]': array elements are invalid.",
        "  Element 0: Value does not equal 2.",
      ].join("\n")
    );
  });
});
