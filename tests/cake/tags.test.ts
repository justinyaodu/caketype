import {
  Assert,
  bake,
  Equivalent,
  Infer,
  number,
  optional,
  string,
} from "../../src";
import { typeCheckOnly } from "../test-helpers";

describe("documentation examples", () => {
  test(
    "optional",
    typeCheckOnly(() => {
      const Person = bake({
        name: string,
        age: optional(number),
      });

      type Person = Infer<typeof Person>;
      type _ = Assert<
        Equivalent<Person, { name: string; age?: number | undefined }>
      >;
    })
  );
});
