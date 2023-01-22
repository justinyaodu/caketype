import { Cake, entriesUnsound, keysUnsound } from "../../src";

function testIs<T extends Record<string, Cake>>(
  cakes: T,
  valuesAndSatisfiedCakeNames: readonly (readonly [
    unknown,
    readonly (keyof T)[]
  ])[]
) {
  const table = valuesAndSatisfiedCakeNames.flatMap(
    ([value, satisfiedCakeNames]) =>
      keysUnsound(cakes).map(
        (cakeName) =>
          [cakeName, value, satisfiedCakeNames.includes(cakeName)] as const
      )
  );
  test.each(table)("%s.is(%p) returns %j", (cakeName, value, expected) => {
    expect(cakes[cakeName].is(value)).toStrictEqual(expected);
  });
}

function testToString<T extends Record<string, { toString: () => string }>>(
  objects: T,
  toStrings: Record<keyof T, string>
) {
  test.each(entriesUnsound(toStrings))(
    "%s.toString() returns %j",
    (key, expected) => {
      expect(objects[key].toString()).toStrictEqual(expected);
    }
  );
}

export { testIs, testToString };
