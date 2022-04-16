import { Transform } from "./transform";

const boolean: Transform<unknown, boolean, boolean> = (input) => {
  if (typeof input === "boolean") {
    return input;
  }
  throw new Error("Not a boolean");
};

const number: Transform<unknown, number, number> = (input) => {
  if (typeof input === "number") {
    return input;
  }
  throw new Error("Not a number");
};

const string: Transform<unknown, string, string> = (input) => {
  if (typeof input === "string") {
    return input;
  }
  throw new Error("Not a string");
};

export { boolean, number, string };
