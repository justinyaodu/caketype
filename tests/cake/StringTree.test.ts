import { prependStringTree } from "../../src/cake/StringTree";

describe("prependStringTree", () => {
  test("string", () => {
    expect(prependStringTree("prefix: ", "thing")).toStrictEqual(
      "prefix: thing"
    );
  });
  test("array", () => {
    expect(prependStringTree("prefix: ", ["thing", ["stuff"]])).toStrictEqual([
      "prefix: thing",
      ["stuff"],
    ]);
  });
});
