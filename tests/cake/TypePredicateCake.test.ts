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
  unknown,
} from "../../src";

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
