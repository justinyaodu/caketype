import {
  array,
  bake,
  boolean,
  keysUnsound,
  number,
  reference,
  TupleCake,
  TypeGuardCake,
  union,
} from "../../src";
import { is_boolean } from "../../src/type-guards";

const cakes = {
  array: array({}),
  literal: bake(0),
  number: number,
  object: bake({}),
  reference: reference<boolean>(() => boolean),
  tuple: new TupleCake({
    startElements: [],
    optionalElements: [],
    restElement: null,
    endElements: [],
  }),
  typeGuard: new TypeGuardCake({ guard: is_boolean }),
  union: union(0),
};

test.each(keysUnsound(cakes))("%s.name is null", (cake) => {
  expect(cakes[cake].name).toStrictEqual(null);
});

test.each(keysUnsound(cakes))(
  "%s.withName() returns new Cake with the name",
  (cake) => {
    expect(cakes[cake].withName("abcd").name).toStrictEqual("abcd");
  }
);
