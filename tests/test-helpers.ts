/**
 * Expect a function to throw a TypeError with an exact message.
 */
function expectTypeError(func: () => unknown, message: string) {
  expect(func).toThrow(TypeError);
  expect(func).toThrow(new Error(message));
}

/**
 * Write test code without running it.
 *
 * This is used to test type checking and type inference without contributing
 * to code coverage.
 */
function typeCheckOnly(_: () => void): () => void {
  return () => undefined;
}

export { expectTypeError, typeCheckOnly };
