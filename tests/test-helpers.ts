/**
 * Write test code without running it.
 *
 * This is used to test type checking and type inference without contributing
 * to code coverage.
 */
function typeCheckOnly(_: () => void): () => void {
  return () => undefined;
}

export { typeCheckOnly };
