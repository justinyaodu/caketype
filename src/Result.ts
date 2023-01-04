/**
 * Represent the result of an operation that could succeed or fail.
 *
 * This is a
 * [discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions),
 * where {@link Ok} represents a successful result, and {@link Err} represents
 * an unsuccessful result.
 *
 * @example Using an existing Result:
 * ```ts
 * function showDecimal(input: string): string {
 *   const result: Result<number, string> = parseBinary(input);
 *   // result is Ok<number> | Err<string>
 *   if (result.ok) {
 *     // result is Ok<number>, so result.value is a number
 *     return `binary ${input} is decimal ${result.value}`;
 *   } else {
 *     // result is Err<string>, so result.error is a string
 *     return `not a binary number: ${result.error}`;
 *   }
 * }
 *
 * showDecimal("101"); // "binary 101 is decimal 5"
 * showDecimal("foo"); // "not a binary number: invalid character"
 * showDecimal("");  // "not a binary number: empty string"
 * ```
 *
 * @example Creating Results:
 * ```ts
 * function parseBinary(input: string): Result<number, string> {
 *   if (input.length === 0) {
 *     return Result.err("empty string");
 *   }
 *   let num = 0;
 *   for (const char of input) {
 *     if (char === "0") {
 *       num = num * 2;
 *     } else if (char === "1") {
 *       num = num * 2 + 1;
 *     } else {
 *       return Result.err("invalid character");
 *     }
 *   }
 *   return Result.ok(num);
 * }
 *
 * parseBinary("101"); // Ok(5)
 * parseBinary("foo"); // Err(invalid character)
 * parseBinary(""); // Err(empty string)
 * ```
 *
 * @public
 */
type Result<T, E> = Ok<T> | Err<E>;

/** @internal */
abstract class ResultClass<T, E> {
  /**
   * Return {@link Ok.value}, or the provided argument if this is not an Ok.
   *
   * @example
   * ```ts
   * Result.ok(5).valueOr(0); // 5
   * Result.err("oops").valueOr(0); // 0
   * ```
   */
  abstract valueOr<U>(ifErr: U): T | U;

  /**
   * Return {@link Err.error}, or the provided argument if this is not an Err.
   *
   * @example
   * ```ts
   * Result.err("oops").errorOr("no error"); // "oops"
   * Result.ok(5).errorOr("no error"); // "no error"
   * ```
   */
  abstract errorOr<F>(ifOk: F): E | F;

  /**
   * Return a string representation of this Result.
   *
   * @example
   * ```ts
   * Result.ok(5).toString(); // "Ok(5)"
   * Result.err({}).toString(); // "Err([object Object])"
   * ```
   */
  abstract toString(): string;
}

/**
 * The result of a successful operation.
 *
 * @see {@link Result.ok} to construct an Ok.
 *
 * @public
 */
class Ok<T> extends ResultClass<T, never> {
  /**
   * Always true. In contrast, {@link Err.ok} is always false.
   */
  readonly ok = true;

  /**
   * The value returned by the successful operation.
   */
  readonly value: T;

  /** @internal */
  constructor(value: T) {
    super();
    this.value = value;
  }

  valueOr(_IGNORED: unknown): T {
    return this.value;
  }

  errorOr<F>(ifOk: F): F {
    return ifOk;
  }

  toString(): string {
    return `Ok(${String(this.value)})`;
  }
}

/**
 * The result of an unsuccessful operation.
 *
 * @see {@link Result.err} to construct an Err.
 *
 * @public
 */
class Err<E> extends ResultClass<never, E> {
  /**
   * Always false. In contrast, {@link Ok.ok} is always true.
   */
  readonly ok = false;

  /**
   * The value returned by the unsuccessful operation.
   */
  readonly error: E;

  /** @internal */
  constructor(error: E) {
    super();
    this.error = error;
  }

  valueOr<U>(ifErr: U): U {
    return ifErr;
  }

  errorOr(_IGNORED: unknown) {
    return this.error;
  }

  toString(): string {
    return `Err(${String(this.error)})`;
  }
}

/** @internal */
interface ResultUtils {
  /**
   * Return an {@link Ok} with the provided value, using undefined if no value
   * is provided.
   *
   * @example
   * ```ts
   * Result.ok(5); // Ok(5)
   * Result.ok(); // Ok(undefined)
   * ```
   */
  ok(): Ok<undefined>;
  ok<T>(value: T): Ok<T>;

  /**
   * Return an {@link Err} with the provided error, using undefined if no error
   * is provided.
   *
   * @example
   * ```ts
   * Result.err("oops"); // Err(oops)
   * Result.err(); // Err(undefined)
   * ```
   */
  err(): Err<undefined>;
  err<E>(error: E): Err<E>;
}

/** @public */
const Result: ResultUtils = {
  ok<T>(value?: T): Ok<T | undefined> {
    return new Ok(value);
  },

  err<T>(error?: T): Err<T | undefined> {
    return new Err(error);
  },
};

export { Result, Ok, Err };
