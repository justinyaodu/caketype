// eslint-disable-next-line @typescript-eslint/no-explicit-any
function is_any(value: unknown): value is any {
  return true;
}

function is_bigint(value: unknown): value is bigint {
  return typeof value === "bigint";
}

function is_boolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function is_never(value: unknown): value is never {
  return false;
}

function is_number(value: unknown): value is number {
  return typeof value === "number";
}

function is_object(value: unknown): value is object {
  switch (typeof value) {
    case "object":
      return value !== null;
    case "function":
      return true;
    default:
      return false;
  }
}

function is_string(value: unknown): value is string {
  return typeof value === "string";
}

function is_symbol(value: unknown): value is symbol {
  return typeof value === "symbol";
}

function is_unknown(value: unknown): value is unknown {
  return true;
}

export {
  is_any,
  is_bigint,
  is_boolean,
  is_never,
  is_number,
  is_object,
  is_string,
  is_symbol,
  is_unknown,
};
