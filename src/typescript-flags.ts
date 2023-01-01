/**
 * Return whether
 * [exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes)
 * is enabled.
 */
type FlagExactOptionalPropertyTypes = { value: undefined } extends {
  value?: boolean;
}
  ? false
  : true;

export { FlagExactOptionalPropertyTypes };
