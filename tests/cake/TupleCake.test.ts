import { boolean, TupleCake } from "../../src";
import { expectTypeError } from "../test-helpers";

test("optional elements followed by required elements", () => {
  expectTypeError(
    () =>
      new TupleCake({
        startElements: [],
        optionalElements: [boolean],
        restElement: null,
        endElements: [boolean],
      }),
    "Cannot create TupleCake with non-empty optionalElements and non-empty endElements, because required elements cannot appear after optional elements in a tuple type."
  );
});
