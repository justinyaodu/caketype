/**
 * Get the type of an object's entries.
 *
 * @example
 * ```ts
 * type Person = { name: string, age: number };
 * type PersonEntry = Entry<Person>;
 * // ["name", string] | ["age", number]
 * ```
 *
 * @see {@link entriesUnsound} to get these entries from an object at runtime.
 *
 * @public
 */
type Entry<T extends object> = {
  [K in keyof T & string]: [K, T[K]];
}[keyof T & string];

/**
 * Get the type of an object's entries, and include entries with symbol keys
 * too.
 *
 * @example
 * ```ts
 * const sym = Symbol("my symbol");
 * type Example = { age: number, [sym]: boolean };
 * type ExampleEntry = EntryIncludingSymbols<Example>;
 * // ["age", number] | [typeof sym, boolean]
 * ```
 *
 * @see {@link entriesIncludingSymbolsUnsound} to get these entries from an
 * object at runtime.
 *
 * @public
 */
type EntryIncludingSymbols<T extends object> = {
  [K in keyof T & (string | symbol)]: [K, T[K]];
}[keyof T & (string | symbol)];

/**
 * Return whether `T[K]` is always present and not `undefined`.
 * @internal
 */
type AlwaysDefined<T extends object, K extends PropertyKey> = K extends keyof T
  ? undefined extends T[K]
    ? false
    : true
  : false;

/** @internal */
type MergeRequiredKeys<T extends object, U extends object> = keyof {
  [K in keyof T | keyof U as AlwaysDefined<T, K> extends true
    ? K
    : AlwaysDefined<U, K> extends true
    ? K
    : never]: "ignore";
};

/** @internal */
type MergeOptionalKeys<T extends object, U extends object> = Exclude<
  keyof T | keyof U,
  MergeRequiredKeys<T, U>
>;

/** @internal */
type TryGet<T extends object, K extends PropertyKey> = K extends keyof T
  ? T[K]
  : never;

/** @internal */
type MergeTwo<T extends object, U extends object> = {
  [K in MergeRequiredKeys<T, U>]:
    | (AlwaysDefined<U, K> extends false ? TryGet<T, K> : never)
    | TryGet<U, K>;
} & {
  [K in MergeOptionalKeys<T, U>]?: TryGet<U, K> | TryGet<T, K>;
} extends infer I
  ? {
      // Remove properties that are always undefined,
      // and remove undefined from property values.
      [K in keyof I as I[K] extends undefined ? never : K]: Exclude<
        I[K],
        undefined
      >;
    }
  : never;

/**
 * The result of {@link merge}.
 * @public
 */
type Merged<T extends [object, ...object[]]> = T extends [
  infer F extends object,
  infer S extends object,
  ...infer R extends object[]
]
  ? Merged<[MergeTwo<F, S>, ...R]>
  : T extends [infer F extends object]
  ? // Use this instead of F to remove properties that are always undefined.
    // eslint-disable-next-line @typescript-eslint/ban-types
    MergeTwo<F, {}>
  : never;

/**
 * Alias for
 * [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).
 *
 * @see {@link keysUnsound} to infer a more specific type for the keys when all
 * of the object's properties are declared in its type.
 *
 * @public
 */
function keys(object: object): string[] {
  return Object.keys(object);
}

/**
 * Like
 * [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys),
 * but use the object type to infer the type of the
 * keys.
 *
 * This is unsound unless all of the object's own enumerable string-keyed
 * properties are declared in its type. If a property is not declared in the
 * object type, its key will not appear in the return type, but the key will
 * still be returned at runtime.
 *
 * @remarks
 *
 * If a property is not enumerable, its key will not be returned at runtime,
 * even if its key appears in the return type.
 *
 * @public
 */
function keysUnsound<T extends object>(object: T): (keyof T & string)[] {
  return Object.keys(object) as (keyof T & string)[];
}

/**
 * Return the string and symbol keys of an object's own enumerable properties.
 *
 * This differs from
 * [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
 * by including symbol keys, and it differs from
 * [Reflect.ownKeys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys)
 * by excluding the keys of non-enumerable properties.
 *
 * @see {@link keysIncludingSymbolsUnsound} to infer a more specific type for
 * the keys when all of the object's properties are declared in its type.
 *
 * @public
 */
function keysIncludingSymbols(object: object): (string | symbol)[] {
  return Reflect.ownKeys(object).filter((key) =>
    Object.prototype.propertyIsEnumerable.call(object, key)
  );
}

/**
 * Like {@link keysIncludingSymbols}, but use the object type to infer the type
 * of the keys.
 *
 * This is unsound unless all of the object's own enumerable properties are
 * declared in its type. If a property is not declared in the object type, its
 * key will not appear in the return type, but the key will still be returned at
 * runtime.
 *
 * @remarks
 *
 * If a property is not enumerable, its key will not be returned at runtime,
 * even if its key appears in the return type.
 *
 * @public
 */
function keysIncludingSymbolsUnsound<T extends object>(
  object: T
): (keyof T & (string | symbol))[] {
  return keysIncludingSymbols(object) as (keyof T & (string | symbol))[];
}

/**
 * Alias for
 * [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
 * with a sound type signature.
 *
 * @see {@link entriesUnsound} to infer a more specific type for the entries
 * when all of the object's properties are declared in its type.
 * @see [this issue](https://github.com/microsoft/TypeScript/issues/38520)
 * explaining why Object.entries is unsound.
 *
 * @public
 */
function entries(object: object): [string, unknown][] {
  return Object.entries(object);
}

/**
 * Like
 * [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries),
 * but use the object type to infer the type of the entries.
 *
 * This is unsound unless all of the object's own enumerable string-keyed
 * properties are declared in its type. If a property is not declared in the
 * object type, its entry will not appear in the return type, but the entry will
 * still be returned at runtime.
 *
 * @remarks
 *
 * If a property is not enumerable, its entry will not be returned at runtime,
 * even if its entry appears in the return type.
 *
 * @public
 */
function entriesUnsound<T extends object>(object: T): Entry<T>[] {
  return Object.entries(object) as Entry<T>[];
}

/**
 * Return the entries of an object's own enumerable properties.
 *
 * This differs from
 * [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
 * by including properties with symbol keys.
 *
 * @see {@link entriesIncludingSymbolsUnsound} to infer a more specific type
 * for the entries when all of the object's properties are declared in its type.
 *
 * @public
 */
function entriesIncludingSymbols(object: object): [string | symbol, unknown][] {
  return keysIncludingSymbols(object).map((k) => [
    k,
    object[k as keyof object],
  ]);
}

/**
 * Like {@link entriesIncludingSymbols}, but use the object type to infer
 * the type of the entries.
 *
 * This is unsound unless all of the object's own enumerable properties are
 * declared in its type. If a property is not declared in the object type, its
 * entry will not appear in the return type, but the entry will still be
 * returned at runtime.
 *
 * @remarks
 *
 * If a property is not enumerable, its entry will not be returned at runtime,
 * even if its entry appears in the return type.
 *
 * @public
 */
function entriesIncludingSymbolsUnsound<T extends object>(
  object: T
): EntryIncludingSymbols<T>[] {
  return entriesIncludingSymbols(object) as EntryIncludingSymbols<T>[];
}

/**
 * Alias for
 * [Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
 * with a sound type signature.
 *
 * @see {@link valuesUnsound} to infer a more specific type for the values when
 * all of the object's properties are declared in its type.
 * @see [this issue](https://github.com/microsoft/TypeScript/issues/38520)
 * explaining why
 * [Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
 * is unsound.
 *
 * @public
 */
function values(object: object): unknown[] {
  return Object.values(object);
}

/**
 * Like
 * [Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values),
 * but use the object type to infer the type of the values.
 *
 * This is unsound unless all of the object's own enumerable string-keyed
 * properties are declared in its type. If a property is not declared in the
 * object type, its value will not appear in the return type, but the value will
 * still be returned at runtime.
 *
 * @remarks
 *
 * If a property is not enumerable, its value will not be returned at runtime,
 * even if its value appears in the return type.
 *
 * @public
 */
function valuesUnsound<T extends object>(object: T): T[keyof T & string][] {
  return values(object) as T[keyof T & string][];
}

/**
 * Return the values of an object's own enumerable properties.
 *
 * This differs from
 * [Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
 * by including properties with symbol keys.
 *
 * @public
 */
function valuesIncludingSymbols(object: object): unknown[] {
  return keysIncludingSymbols(object).map((k) => object[k as keyof object]);
}

/**
 * Like {@link valuesIncludingSymbols}, but use the object type to infer the
 * type of the values.
 *
 *
 * This is unsound unless all of the object's own enumerable properties are
 * declared in its type. If a property is not declared in the object type, its
 * value will not appear in the return type, but the value will still be
 * returned at runtime.
 *
 * @remarks
 *
 * If a property is not enumerable, its value will not be returned at runtime,
 * even if its value appears in the return type.
 *
 * @public
 */
function valuesIncludingSymbolsUnsound<T extends object>(
  object: T
): T[keyof T & (string | symbol)][] {
  return valuesIncludingSymbols(object) as T[keyof T & (string | symbol)][];
}

/**
 * Return a new object created by mapping the enumerable own property values of
 * an existing object. This is analogous to
 * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
 *
 * @see {@link mapValuesUnsound} to infer more specific types for the keys and
 * values when all of the object's properties are declared in its type.
 *
 * @public
 */
function mapValues<T extends object, R>(
  object: T,
  mapper: (value: unknown, key: string | symbol, object: T) => R
): { [K in keyof T & (string | symbol)]: R } {
  return Object.fromEntries(
    entriesIncludingSymbols(object).map(([key, value]) => [
      key,
      mapper(value, key, object),
    ])
  ) as { [K in keyof T & (string | symbol)]: R };
}

/**
 * Like {@link mapValues}, but use the object type to infer the types of the
 * values and keys.
 *
 * This is unsound unless all of the object's own enumerable properties are
 * declared in its type. If a property is not declared in the object type, its
 * key and value cannot be type-checked against the function parameter types,
 * but the function will still be called with that key and value at runtime.
 *
 * @public
 */
function mapValuesUnsound<T extends object, R>(
  object: T,
  mapper: <K extends keyof T & (string | symbol)>(
    value: T[K],
    key: K,
    object: T
  ) => R
): { [K in keyof T & (string | symbol)]: R } {
  return mapValues(
    object,
    mapper as (value: unknown, key: string | symbol, object: T) => R
  );
}

type LookupReturn<K extends PropertyKey, T extends object[]> = T extends []
  ? undefined
  : T extends [infer F, ...infer R extends object[]]
  ? K extends keyof F
    ?
        | Exclude<F[K], undefined>
        | (undefined extends F[K] ? LookupReturn<K, R> : never)
    : LookupReturn<K, R>
  : never;

/**
 * Find the first object with the given key set to a non-`undefined` value, and
 * return that value. If none of the objects have a non-`undefined` value,
 * return `undefined`.
 *
 * @example
 * ```ts
 * lookup("a", { a: 1 }, { a: 2 }); // 1
 * lookup("a", { a: undefined }, { a: 2 }); // 2
 * lookup("a", {}, { a: 2 }); // 2
 * lookup("a", {}, {}); // undefined
 * ```
 *
 * @example If the objects contain properties that are not declared in their
 * types, the inferred return type could be incorrect. This is because an
 * undeclared property can take precedence over a declared property on a later
 * object:
 * ```ts
 * const aNumber = { value: 3 };
 * const aString = { value: "hi" };
 *
 * // property 'value' is not declared in type, but present at runtime
 * const propertyNotDeclared: {} = aString;
 *
 * const wrong: number = lookup("value", propertyNotDeclared, aNumber);
 * // no type errors, but at runtime, wrong is "hi"
 * ```
 *
 * @public
 */
function lookup<K extends PropertyKey, T extends [object, ...object[]]>(
  key: K,
  ...objects: T
): LookupReturn<K, T> {
  for (const object of objects) {
    if (key in object) {
      const value = (object as Record<PropertyKey, unknown>)[key];
      if (value !== undefined) {
        return value as LookupReturn<K, T>;
      }
    }
  }
  return undefined as LookupReturn<K, T>;
}

/**
 * Return a new object created by merging the enumerable own properties of the
 * provided objects, skipping properties that are explicitly set to `undefined`.
 *
 * @example
 * ```ts
 * merge({ a: 1, b: 2, c: 3 }, { a: 99, b: undefined });
 * // { a: 99, b: 2, c: 3 }
 * ```
 *
 * @example If the objects contain properties that are not declared in their
 * types, the inferred type of the merged object could be incorrect. This is
 * because an undeclared property can replace a declared property from a
 * preceding object:
 * ```ts
 * const aNumber = { value: 3 };
 * const aString = { value: "hi" };
 *
 * // property 'value' is not declared in type, but present at runtime
 * const propertyNotDeclared: {} = aString;
 *
 * const wrong: { value: number } = merge(aNumber, propertyNotDeclared);
 * // no type errors, but at runtime, wrong is { value: "hi" }
 * ```
 *
 * @remarks
 *
 * By default, TypeScript allows optional properties to be explicitly set to
 * `undefined`. When merging partial objects, it's often desirable to skip
 * properties that are set to `undefined` in order to use a default value:
 *
 * ```ts
 * const defaults = { muted: false, volume: 20 };
 * const muted = merge(defaults, { muted: true, volume: undefined });
 * // { muted: true, volume: 20 }
 * ```
 *
 * [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
 * and
 * [object spreading](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals)
 * do not give the desired result:
 *
 * ```ts
 * const wrong1 = { ...defaults, ...{ muted: true, volume: undefined } };
 * // { muted: true, volume: undefined }
 * ```
 *
 * If the TypeScript flag
 * [exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes)
 * is not enabled, then `undefined` can be assigned to any optional property,
 * and object spreading is unsound:
 *
 * ```ts
 * type Config = { muted: boolean, volume: number };
 * const overrides: Partial<Config> = { muted: true, volume: undefined };
 * const wrong2: Config = { ...defaults, ...overrides };
 *
 * const volume: number = wrong2.volume;
 * // no type errors, but at runtime, volume is undefined
 * ```
 *
 * @public
 */
function merge<T extends [object, ...object[]]>(...objects: T): Merged<T> {
  const merged = {} as Record<string | symbol, unknown>;
  for (const object of objects) {
    for (const [key, value] of entriesIncludingSymbols(object)) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }
  }
  return merged as Merged<T>;
}

/**
 * Return a new object created by copying the enumerable own properties of a
 * source object, but omitting the properties with the specified keys.
 *
 * The type of the returned object will be inaccurate if any of the keys are not
 * literal strings or unique symbols. For example, providing a key with type
 * `string` will omit all string-keyed properties from the type of the returned
 * object. This type inference limitation does not affect the runtime behavior.
 *
 * @see {@link omit} to restrict the keys to `keyof T`.
 *
 * @public
 */
function omitLoose<T extends object, K extends (string | symbol)[]>(
  object: T,
  ...keys: K
): { [L in Exclude<keyof T, K[number]>]: T[L] } {
  const omitted = { ...object };
  for (const key of keys) {
    delete omitted[key as keyof T];
  }
  return omitted as { [L in Exclude<keyof T, K[number]>]: T[L] };
}

/**
 * Return a new object created by copying the enumerable own properties of a
 * source object, but omitting the properties with the specified keys.
 *
 * @see {@link omitLoose} to allow keys that are not `keyof T`.
 *
 * @public
 */
function omit<T extends object, K extends (keyof T & (string | symbol))[]>(
  object: T,
  ...keys: K
): { [L in Exclude<keyof T, K[number]>]: T[L] } {
  return omitLoose(object, ...keys);
}

/**
 * Return a new object created by copying the properties of a source object with
 * the specified keys.
 *
 * @remarks
 *
 * Non-enumerable properties are copied from the source object, but the
 * properties will be enumerable in the returned object.
 *
 * @public
 */
function pick<T extends object, K extends (keyof T & (string | symbol))[]>(
  object: T,
  ...keys: K
): { [L in K[number]]: T[L] } {
  const picked = {} as T;
  for (const key of keys) {
    picked[key] = object[key];
  }
  return picked;
}

/**
 * Utility functions for manipulating objects.
 *
 * These functions can be imported directly, or accessed as properties of
 * `ObjectUtils`:
 *
 * ```ts
 * import { merge } from "caketype";
 * merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
 *
 * // alternatively:
 * import { ObjectUtils } from "caketype";
 * ObjectUtils.merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
 * ```
 *
 * @public
 */
const ObjectUtils = {
  entries,
  entriesIncludingSymbols,
  entriesIncludingSymbolsUnsound,
  entriesUnsound,
  keys,
  keysIncludingSymbols,
  keysIncludingSymbolsUnsound,
  keysUnsound,
  mapValues,
  mapValuesUnsound,
  merge,
  omit,
  omitLoose,
  pick,
  values,
  valuesIncludingSymbols,
  valuesIncludingSymbolsUnsound,
  valuesUnsound,
} as const;

export {
  Entry,
  EntryIncludingSymbols,
  Merged,
  ObjectUtils,
  entries,
  entriesIncludingSymbols,
  entriesIncludingSymbolsUnsound,
  entriesUnsound,
  keys,
  keysIncludingSymbols,
  keysIncludingSymbolsUnsound,
  keysUnsound,
  lookup,
  mapValues,
  mapValuesUnsound,
  merge,
  omit,
  omitLoose,
  pick,
  values,
  valuesIncludingSymbols,
  valuesIncludingSymbolsUnsound,
  valuesUnsound,
};
