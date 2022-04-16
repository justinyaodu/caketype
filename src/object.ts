function pick<T, K extends [] | [keyof T, ...(keyof T)[]]>(
  obj: T,
  ...keys: K
): { [key in K[number]]: T[key] } {
  const picked = {} as { [key in K[number]]: T[key] };
  for (const key of keys) {
    picked[key] = obj[key];
  }
  return picked;
}

function omit<T, K extends [] | [keyof T, ...(keyof T)[]]>(
  obj: T,
  ...keys: K
): { [key in Exclude<keyof T, K[number]>]: T[key] } {
  const omitted = Object.assign({}, obj);
  for (const key of keys) {
    delete omitted[key];
  }
  return omitted;
}

export { omit, pick };
