/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CakeError,
  number,
  ObjectCake,
  string,
  TypePredicateFailedCakeError,
  NotAnObjectCakeError,
  ObjectPropertiesCakeError,
  ObjectRequiredPropertyMissingCakeError,
  keysUnsound,
  Result,
  optional,
  CircularReferenceCakeError,
  reference,
  Cake,
  entriesUnsound,
} from "../../src";

interface CircularName {
  name?: CircularName | undefined;
}
const circularName: Cake<CircularName> = new ObjectCake({
  name: optional(reference<CircularName>(() => circularName)),
});

// TODO: nested objects, symbol keys
const cakes = {
  person: new ObjectCake({
    name: string,
    height: optional(number),
  }),
  empty: new ObjectCake({}),
  circularName,
} as const;

const toStrings: { [K in keyof typeof cakes]: string } = {
  person: "{name: string, height?: (number) | undefined}",
  empty: "{}",
  circularName: "{name?: (reference(() => [Circular])) | undefined}",
};

test.each(entriesUnsound(toStrings))(
  "%s.toString() returns %p",
  (cake, expected) => {
    expect(cakes[cake].toString()).toStrictEqual(expected);
  }
);

const circularNameObj = (() => {
  const obj = {};
  (obj as any).name = obj;
  return obj;
})();

const values: {
  [K in keyof typeof cakes]: Record<
    string,
    [unknown, (cake: typeof cakes[K], value: unknown) => CakeError | null]
  >;
} = {
  person: {
    notObject: ["oops", (c, o) => new NotAnObjectCakeError(c, o)],
    optionalPresent: [
      {
        name: "Alice",
        height: 0,
      },
      () => null,
    ],
    optionalAbsent: [
      {
        name: "Alice",
      },
      () => null,
    ],
    optionalUndefined: [
      {
        name: "Alice",
        height: undefined,
      },
      () => null,
    ],
    requiredMissing: [
      {},
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new ObjectRequiredPropertyMissingCakeError(c.properties.name),
        }),
    ],
    requiredWrong: [
      {
        name: false,
      },
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new TypePredicateFailedCakeError(c.properties.name, false),
        }),
    ],
    optionalWrong: [
      {
        name: "Alice",
        height: null,
      },
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          height: new TypePredicateFailedCakeError(
            c.properties.height.untagged,
            null
          ),
        }),
    ],
    bothWrong: [
      {
        name: 1234,
        height: "oops",
      },
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new TypePredicateFailedCakeError(c.properties.name, 1234),
          height: new TypePredicateFailedCakeError(
            c.properties.height.untagged,
            "oops"
          ),
        }),
    ],
    circularNameObj: [
      circularNameObj,
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new TypePredicateFailedCakeError(c.properties.name, o),
        }),
    ],
  },
  empty: {
    empty: [{}, () => null],
    function: [() => undefined, () => null],
    circularNameObj: [circularNameObj, () => null],
  },
  circularName: {
    circularNameObj: [
      circularNameObj,
      (c, o) =>
        new ObjectPropertiesCakeError(c as any, o as object, {
          name: new CircularReferenceCakeError(
            (c as any).properties.name.untagged.get(),
            o
          ),
        }),
    ],
  },
};

const cakeValueTable: (readonly [
  keyof typeof cakes,
  string,
  unknown,
  CakeError | null
])[] = keysUnsound(cakes).flatMap((cake) =>
  Object.entries(values[cake]).map(([valueName, [value, errorProvider]]) => [
    cake,
    valueName,
    value,
    errorProvider(cakes[cake] as any, value),
  ])
);

test.each(cakeValueTable)("%s.check(s)", (cake, _, value, error) => {
  expect(cakes[cake].check(value)).toStrictEqual(
    error === null ? Result.ok(value) : Result.err(error)
  );
});
