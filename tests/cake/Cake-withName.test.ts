import {
  bake,
  boolean,
  keysUnsound,
  reference,
  TypeGuardCake,
} from "../../src";
import { is_boolean } from "../../src/type-guards";

const cakes = {
  object: bake({}),
  typeGuard: new TypeGuardCake({ guard: is_boolean }),
  reference: reference(() => boolean),
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
