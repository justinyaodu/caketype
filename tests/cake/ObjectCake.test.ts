/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CakeError,
  number,
  ObjectCake,
  string,
  TypeGuardFailedCakeError,
  NotAnObjectCakeError,
  ObjectPropertiesCakeError,
  RequiredPropertyMissingCakeError,
  keysUnsound,
  Result,
  optional,
  CircularReferenceCakeError,
  reference,
  Cake,
  entriesUnsound,
  boolean,
  bake,
} from "../../src";
import { ExcessPropertyPresentCakeError } from "../../src/cake/ObjectCake";

interface CircularName {
  name?: CircularName | undefined;
}
const circularName: Cake<CircularName> = new ObjectCake({
  properties: {
    name: optional(reference<CircularName>(() => circularName)),
  },
});

// TODO: nested objects, symbol keys
const cakes = {
  person: new ObjectCake({
    properties: {
      name: string,
      age: optional(number),
    },
  }),
  empty: new ObjectCake({ properties: {} }),
  circularName,
} as const;

const toStrings: { [K in keyof typeof cakes]: string } = {
  person: "{name: string, age?: (number) | undefined}",
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
        `Value does not satisfy type '{name: string, age?: (number) | undefined}': value is not an object.`,
      ].join("\n"),
    ],
    optionalPresent: [
      {
        name: "Alice",
        age: 0,
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
        age: undefined,
      },
      () => null,
    ],
    requiredMissing: [
      {},
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new RequiredPropertyMissingCakeError(c.properties.name),
        }),
      [
        `Value does not satisfy type '{name: string, age?: (number) | undefined}': object properties are invalid.`,
        `  Property "name": Required property is missing.`,
      ].join("\n"),
    ],
    requiredWrong: [
      {
        name: false,
      },
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new TypeGuardFailedCakeError(c.properties.name, false),
        }),
    ],
    optionalWrong: [
      {
        name: "Alice",
        age: null,
      },
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          age: new TypeGuardFailedCakeError(c.properties.age.untagged, null),
        }),
    ],
    bothWrong: [
      {
        name: 1234,
        age: "oops",
      },
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new TypeGuardFailedCakeError(c.properties.name, 1234),
          age: new TypeGuardFailedCakeError(c.properties.age.untagged, "oops"),
        }),
      [
        `Value does not satisfy type '{name: string, age?: (number) | undefined}': object properties are invalid.`,
        `  Property "name": Value does not satisfy type 'string': type guard failed.`,
        `  Property "age": Value does not satisfy type 'number': type guard failed.`,
      ].join("\n"),
    ],
    circularNameObj: [
      circularNameObj,
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new TypeGuardFailedCakeError(c.properties.name, o),
        }),
    ],
  },
  empty: {
    empty: [{}, () => null],
    circularNameObj: [
      circularNameObj,
      (c, o) =>
        new ObjectPropertiesCakeError(c, o as object, {
          name: new ExcessPropertyPresentCakeError(o),
        }),
    ],
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
    properties: {
      [sym]: boolean,
      "with space": number,
      [Symbol.iterator]: string,
    },
  });
  expect(cake.toString()).toStrictEqual(
    `{"with space": number, [Symbol(sym)]: boolean, [Symbol(Symbol.iterator)]: string}`
  );
});

test("function satisfies empty shape", () => {
  expect(bake({}).isShape(() => null)).toStrictEqual(true);
});
