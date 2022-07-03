type Assert<_T extends true> = true;
type AssertAll<_T extends true[]> = true;

type Not<T extends boolean> = T extends true
  ? false
  : T extends false
  ? true
  : boolean;

type Equivalent<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;

export { Assert, AssertAll, Equivalent, Not };
