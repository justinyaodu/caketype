import { Err, Ok, Result } from "../src";

describe("documentation examples", () => {
  test("Result", () => {
    function showDecimal(input: string): string {
      // Result<number, string> is an alias for Ok<number> | Err<string>
      const result: Result<number, string> = parseBinary(input);
      if (result.ok) {
        // result is narrowed to Ok<number>
        const num: number = result.value;
        return `binary ${input} is decimal ${num}`;
      } else {
        // result is narrowed to Err<string>
        const message: string = result.error;
        return `not a binary number: ${message}`;
      }
    }

    expect(showDecimal("101")).toStrictEqual("binary 101 is decimal 5");
    expect(showDecimal("foo")).toStrictEqual(
      "not a binary number: invalid character"
    );
    expect(showDecimal("")).toStrictEqual("not a binary number: empty string");

    function parseBinary(input: string): Result<number, string> {
      if (input.length === 0) {
        return Result.err("empty string");
      }
      let num = 0;
      for (let i = 0; i < input.length; i++) {
        if (input[i] === "0") {
          num = num * 2;
        } else if (input[i] === "1") {
          num = num * 2 + 1;
        } else {
          return Result.err("invalid character");
        }
      }
      return Result.ok(num);
    }

    expect(parseBinary("101")).toStrictEqual(Result.ok(5));
    expect(parseBinary("foo")).toStrictEqual(Result.err("invalid character"));
    expect(parseBinary("")).toStrictEqual(Result.err("empty string"));
  });

  test("valueOr", () => {
    expect(Result.ok(5).valueOr(0)).toStrictEqual(5);
    expect(Result.err("oops").valueOr(0)).toStrictEqual(0);
  });

  test("errorOr", () => {
    expect(Result.err("oops").errorOr("no error")).toStrictEqual("oops");
    expect(Result.ok(5).errorOr("no error")).toStrictEqual("no error");
  });

  test("toString", () => {
    expect(Result.ok(5).toString()).toStrictEqual("Ok(5)");
    expect(Result.err({}).toString()).toStrictEqual("Err([object Object])");
  });

  test("Result.ok", () => {
    expect(Result.ok(5)).toStrictEqual(new Ok(5));
    expect<Ok<undefined>>(Result.ok()).toStrictEqual(new Ok(undefined));
  });

  test("Result.err", () => {
    expect(Result.err("oops")).toStrictEqual(new Err("oops"));
    expect<Err<undefined>>(Result.err()).toStrictEqual(new Err(undefined));
  });
});
