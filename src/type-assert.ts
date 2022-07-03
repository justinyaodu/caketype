type Assert<T extends true> = T;
type Equivalent<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;
type Not<T extends boolean> = T extends true
  ? false
  : T extends false
  ? true
  : boolean;

export { Assert, Equivalent, Not };
