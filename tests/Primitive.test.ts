import { AssertExtends, Extends, Primitive } from "../src";

const primitivesAndStrings: [Primitive, string][] = [
  [BigInt(-27), "-27n"],
  [false, "false"],
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

test.each(primitivesAndStrings)(
  "Primitive.is(%p) returns true",
  (primitive) => {
    expect(Primitive.is(primitive)).toStrictEqual(true);
  }
);

test.each(primitivesAndStrings)(
  "Primitive.stringify(%p) returns %p",
  (primitive, string) => {
    expect(Primitive.stringify(primitive)).toStrictEqual(string);
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

test.each(notPrimitives)("Primitive.is(%p) returns false", (notPrimitive) => {
  expect(Primitive.is(notPrimitive)).toStrictEqual(false);
});
