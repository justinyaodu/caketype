type Primitive = bigint | boolean | number | string | symbol | null;

function isPrimitive(input: unknown): input is Primitive {
  switch (typeof input) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "symbol":
      return true;
    case "object":
      return input === null;
    default:
      return false;
  }
}

function reprPrimitive(value: Primitive): string {
  switch (typeof value) {
    case "bigint":
      return value.toString() + "n";
    case "string":
      return JSON.stringify(value);
    case "symbol":
      return value.toString();
    default:
      return "" + value;
  }
}

export { Primitive, isPrimitive, reprPrimitive };
