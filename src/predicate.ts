type Predicate<T> = (input: T) => void | boolean | string;

function assertPredicate<T>(predicate: Predicate<T>, input: T) {
  const result = predicate(input);
  if (result === undefined) {
    return;
  }
  if (typeof result === "string") {
    throw new Error(result);
  }
  if (!result) {
    throw new Error("Predicate returned false");
  }
}

export { Predicate, assertPredicate };
