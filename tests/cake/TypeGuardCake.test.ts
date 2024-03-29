import {
  any,
  bigint,
  boolean,
  entriesUnsound,
  keysUnsound,
  never,
  number,
  string,
  symbol,
  TypeGuardCake,
  unknown,
} from "../../src";

describe("documentation examples", () => {
  test("any", () => {
    expect(any.is("hello")).toStrictEqual(true);
    expect(any.is(null)).toStrictEqual(true);
  });

  test("boolean", () => {
    expect(boolean.is(true)).toStrictEqual(true);
    expect(boolean.is(1)).toStrictEqual(false);
  });

  test("bigint", () => {
    expect(bigint.is(BigInt(5))).toStrictEqual(true);
    expect(bigint.is(5)).toStrictEqual(false);
  });

  test("never", () => {
    expect(never.is("hello")).toStrictEqual(false);
    expect(never.is(undefined)).toStrictEqual(false);
  });

  test("symbol", () => {
    expect(symbol.is(Symbol.iterator)).toStrictEqual(true);
    expect(symbol.is(Symbol("hi"))).toStrictEqual(true);
  });

  test("unknown", () => {
    expect(unknown.is("hello")).toStrictEqual(true);
    expect(unknown.is(null)).toStrictEqual(true);
  });
});

const cakes = {
  any,
  bigint,
  boolean,
  never,
  number,
  string,
  symbol,
  unknown,
} as const;

test.each(entriesUnsound(cakes))("%s.toString()", (name, cake) => {
  expect(cake.toString()).toStrictEqual(name);
});

const cakeValueTable: (readonly [keyof typeof cakes, unknown, boolean])[] =
  (() => {
    let valuesAndSelectedCakes: [unknown, (keyof typeof cakes)[]][] = [
      [BigInt(5), ["bigint"]],
      [false, ["boolean"]],
      [7, ["number"]],
      ["hi", ["string"]],
      [Symbol.iterator, ["symbol"]],
      [null, []],
      [undefined, []],
      [{}, []],
      [[], []],
      [() => 0, []],
      [Date, []],
    ];

    valuesAndSelectedCakes = valuesAndSelectedCakes.map(
      ([value, selectedCakes]) => [
        value,
        selectedCakes.concat(["any", "unknown"]),
      ]
    );

    return valuesAndSelectedCakes.flatMap(([value, selectedCakes]) =>
      keysUnsound(cakes).map(
        (cake) => [cake, value, selectedCakes.includes(cake)] as const
      )
    );
  })();

test.each(cakeValueTable)("%s.is(%p) returns %p", (cake, value, expected) => {
  expect(cakes[cake].is(value)).toStrictEqual(expected);
});

test.each(cakeValueTable.filter((tuple) => tuple[2]))(
  "%s.as(%p) returns the value",
  (cake, value) => {
    expect(cakes[cake].as(value)).toStrictEqual(value);
  }
);

test.each(cakeValueTable.filter((tuple) => !tuple[2]))(
  "%s.as(%p) throws TypeError",
  (cake, value) => {
    expect(() => cakes[cake].as(value)).toThrow(TypeError);
  }
);

test("stringify unnamed", () => {
  function myGuard(value: unknown): value is boolean {
    return typeof value === "boolean";
  }

  const guard = new TypeGuardCake({ guard: myGuard });
  expect(guard.toString()).toStrictEqual("(type guard myGuard)");
});
