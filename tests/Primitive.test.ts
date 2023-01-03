import {
  AssertExtends,
  Extends,
  Primitive,
  isPrimitive,
  stringifyPrimitive,
} from "../src";

const primitivesAndStrings: [Primitive, string][] = [
  [BigInt(-27), "-27n"],
  [false, "false"],
  [5, "5"],
  [3.75, "3.75"],
  [-Infinity, "-Infinity"],
  [-0, "0"],
  [NaN, "NaN"],
  ["hi\nbye", '"hi\\nbye"'],
  [Symbol("apple"), "Symbol(apple)"],
  [Symbol.iterator, "Symbol(Symbol.iterator)"],
  [null, "null"],
  [undefined, "undefined"],
];

test.each(primitivesAndStrings)("isPrimitive(%p) returns true", (primitive) => {
  expect(isPrimitive(primitive)).toStrictEqual(true);
});

test.each(primitivesAndStrings)(
  "stringifyPrimitive(%p) returns %p",
  (primitive, string) => {
    expect(stringifyPrimitive(primitive)).toStrictEqual(string);
  }
);

const notPrimitives = [
  [],
  {},
  Date,
  new Date(0),
  new Number("-5"),
  () => null,
] as const;

// Ensure that every element of notPrimitives is not a Primitive. You can test
// this logic by adding a primitive value to notPrimitives and looking for the
// type error.
type MapIsPrimitive<T extends readonly unknown[]> = T extends readonly [
  infer F,
  ...infer R
]
  ? [Extends<F, Primitive>, ...MapIsPrimitive<R>]
  : [];
type _ = AssertExtends<MapIsPrimitive<typeof notPrimitives>, false[]>;

test.each(notPrimitives)("isPrimitive(%p) returns false", (notPrimitive) => {
  expect(isPrimitive(notPrimitive)).toStrictEqual(false);
});
