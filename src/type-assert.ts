type Assert<T extends true> = T;
type Equivalent<T, U> = T extends U ? (U extends T ? true : false) : false;
type Extends<T, U> = T extends U ? true : false;
type NotExtends<T, U> = T extends U ? false : true;

export { Assert, Equivalent, Extends, NotExtends };
