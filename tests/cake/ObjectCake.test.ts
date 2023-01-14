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
  boolean,
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
    [
      unknown,
      (cake: typeof cakes[K], value: unknown) => CakeError | null,
      string?
    ]
  >;
} = {
  person: {
    notObject: [
      "oops",
      (c, o) => new NotAnObjectCakeError(c, o),
      [
        `Value does not satisfy type '{name: string, height?: (number) | undefined}': value is not an object.`,
      ].join("\n"),
    ],
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
      [
        `Value does not satisfy type '{name: string, height?: (number) | undefined}': object properties are invalid.`,
        `  Property "name": Required property is missing.`,
      ].join("\n"),
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
      [
        `Value does not satisfy type '{name: string, height?: (number) | undefined}': object properties are invalid.`,
        `  Property "name": Value does not satisfy type 'string': type predicate failed.`,
        `  Property "height": Value does not satisfy type 'number': type predicate failed.`,
      ].join("\n"),
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
      [
        `Value does not satisfy type '{name?: (reference(() => [Circular])) | undefined}': object properties are invalid.`,
        `  Property "name": Could not determine if value satisfies type '{name?: (reference(() => [Circular])) | undefined}': value contains a circular reference.`,
      ].join("\n"),
    ],
  },
};

const cakeValueTable: (readonly [
  keyof typeof cakes,
  string,
  unknown,
  CakeError | null,
  string | undefined
])[] = keysUnsound(cakes).flatMap((cake) =>
  Object.entries(values[cake]).map(
    ([valueName, [value, errorProvider, errorString]]) => [
      cake,
      valueName,
      value,
      errorProvider(cakes[cake] as any, value),
      errorString,
    ]
  )
);

test.each(cakeValueTable)(
  "%s.check(s)",
  (cake, _, value, error, errorString) => {
    const result = cakes[cake].check(value);
    expect(result).toStrictEqual(
      error === null ? Result.ok(value) : Result.err(error)
    );
    if (errorString !== undefined && !result.ok) {
      expect(result.error.toString()).toStrictEqual(errorString);
    }
  }
);

test("toString with weird keys", () => {
  const sym = Symbol("sym");
  const cake = new ObjectCake({
    [sym]: boolean,
    "with space": number,
    [Symbol.iterator]: string,
  });
  expect(cake.toString()).toStrictEqual(
    `{"with space": number, [Symbol(sym)]: boolean, [Symbol(Symbol.iterator)]: string}`
  );
});
