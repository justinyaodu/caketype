/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Result } from "./index-internal";
import type {
  // These are only used for TSDoc @link's.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Err,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Ok,
} from "./index-internal";

/**
 * Common interface for
 * [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s
 * and
 * [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)s.
 *
 * @public
 */
interface MapLike<K, V> {
  /**
   * See
   * [Map.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete).
   */
  delete(key: K): boolean;

  /**
   * See
   * [Map.get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get).
   */
  get(key: K): V | undefined;

  /**
   * See
   * [Map.has](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has).
   */
  has(key: K): boolean;

  /**
   * See
   * [Map.set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set).
   */
  set(key: K, value: V): MapLike<K, V>;
}

/**
 * Like
 * [Map.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete),
 * but return an {@link Ok} with the value of the deleted entry, or an
 * {@link Err} if the entry does not exist.
 *
 * ```ts
 * const map: Map<number, string> = new Map();
 * map.set(3, "hi");
 *
 * deleteResult(map, 3); // Ok("hi")
 * // map is empty now
 *
 * deleteResult(map, 3); // Err(undefined)
 * ```
 *
 * @public
 */
function deleteResult<K, V>(map: MapLike<K, V>, key: K): Result<V, undefined> {
  if (!map.has(key)) {
    return Result.err();
  }

  const value = map.get(key)!;
  map.delete(key);
  return Result.ok(value);
}

/**
 * Like
 * [Map.get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get),
 * but return an {@link Ok} with the retrieved value, or an {@link Err} if the
 * entry does not exist.
 *
 * ```ts
 * const map: Map<number, string> = new Map();
 * map.set(3, "hi");
 *
 * getResult(map, 3); // Ok("hi")
 * getResult(map, 4); // Err(undefined)
 * ```
 *
 * @public
 */
function getResult<K, V>(map: MapLike<K, V>, key: K): Result<V, undefined> {
  if (map.has(key)) {
    return Result.ok(map.get(key)!);
  }
  return Result.err();
}

/**
 * If the map has an entry with the provided key, return the existing value.
 * Otherwise, insert an entry with the provided key and default value, and
 * return the inserted value.
 *
 * ```ts
 * const map: Map<number, string> = new Map();
 * map.set(3, "hi");
 *
 * getOrSet(map, 3, "default"); // "hi"
 * // map is unchanged
 *
 * getOrSet(map, 4, "default"); // "default"
 * // map is now Map { 3 -> "hi", 4 -> "default" }
 * ```
 *
 * @see {@link getOrSetComputed} to avoid constructing a default value if the
 * key is present.
 *
 * @public
 */
function getOrSet<K, V>(map: MapLike<K, V>, key: K, defaultValue: V) {
  if (map.has(key)) {
    return map.get(key)!;
  }

  map.set(key, defaultValue);
  return defaultValue;
}

/**
 * If the map has an entry with the provided key, return the existing value.
 * Otherwise, use the callback to compute a new value, insert an entry with the
 * provided key and computed value, and return the inserted value.
 * value.
 *
 * @example
 * ```ts
 * const map: Map<string, string[]> = new Map();
 *
 * getOrSetComputed(map, "alice", () => []).push("bob");
 * // "alice" is not present, so the value [] is computed and returned
 * // then "bob" is added to the returned array
 * // map is now Map { "alice" -> ["bob"] }
 *
 * getOrSetComputed(map, "alice", () => []).push("cindy");
 * // "alice" is present, so the existing array ["bob"] is returned
 * // then "cindy" is added to the returned array
 * // map is now Map { "alice" -> ["bob", "cindy"] }
 * ```
 *
 * @example The callback can use the map key to compute the new value:
 * ```ts
 * const map: Map<string, string[]> = new Map();
 *
 * getOrSetComputed(map, "alice", (name) => [name]).push("bob");
 * // "alice" is not present, so the value ["alice"] is computed and returned
 * // then "bob" is added to the returned array
 * // map is now Map { "alice" -> ["alice", "bob"] }
 * ```
 *
 * @see {@link getOrSet} to use a constant instead of a computed value.
 *
 * @public
 */
function getOrSetComputed<K, V>(
  map: MapLike<K, V>,
  key: K,
  keyToDefaultValue: (key: K) => V
): V {
  if (map.has(key)) {
    return map.get(key)!;
  }

  const created = keyToDefaultValue(key);
  map.set(key, created);
  return created;
}

/**
 * A nested {@link MapLike} that can be accessed by a sequence of keys.
 * @internal
 */
type DeepMapLike<K extends [unknown, ...unknown[]]> = K extends [
  infer F,
  ...infer R
]
  ? R extends [unknown, ...unknown[]]
    ? MapLike<F, DeepMapLike<R>>
    : MapLike<F, unknown>
  : never;

/** @internal */
type DeepMapRecursive<K extends [unknown, ...unknown[]]> = K extends [
  infer F,
  ...infer R
]
  ? R extends [unknown, ...unknown[]]
    ? Map<F, DeepMapRecursive<R>>
    : Map<F, unknown>
  : never;

/**
 * A nested {@link MapLike} that can be accessed by a sequence of keys, where
 * all of the inner maps are
 * [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s.
 * This makes it possible to create new inner maps at runtime.
 *
 * @internal
 */
type DeepMap<K extends [unknown, ...unknown[]]> = K extends [
  infer F,
  ...infer R
]
  ? R extends [unknown, ...unknown[]]
    ? MapLike<F, DeepMapRecursive<R>>
    : MapLike<F, unknown>
  : never;

/**
 * The result of accessing a nested {@link MapLike} with a sequence of keys.
 *
 * @internal
 */
type DeepValue<M, K extends unknown[]> = K extends [infer F, ...infer L]
  ? M extends MapLike<F, infer N>
    ? DeepValue<N, L>
    : never
  : M;

function deepTraverse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: MapLike<any, any>,
  keys: unknown[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Result<MapLike<any, any>, undefined> {
  let current = map;
  for (const key of keys) {
    const result = getResult(current, key);
    if (!result.ok) {
      return Result.err();
    }
    current = result.value;
  }
  return Result.ok(current);
}

/**
 * Like
 * [Map.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete),
 * but use a sequence of keys to delete an entry from a nested map.
 *
 * @example
 * ```ts
 * const map: Map<number, Map<string, number>> = new Map();
 * map.set(3, new Map());
 * map.get(3).set("hi", 7);
 * // map is Map { 3 -> Map { "hi" -> 7 } }
 *
 * deepDelete(map, 3, "hi"); // true
 * // map is Map { 3 -> Map {} }
 *
 * deepDeleteResult(map, 3, "hi"); // false
 * ```
 *
 * @public
 */
function deepDelete<
  M extends DeepMapLike<K>,
  K extends [unknown, ...unknown[]]
>(map: M, ...keys: K): boolean {
  return deepDeleteResult(map, ...keys).ok;
}

/**
 * Like {@link deepDelete}, but return an {@link Ok} with the value of the
 * deleted entry, or {@link Err} if the entry does not exist.
 *
 * @example
 * ```ts
 * const map: Map<number, Map<string, number>> = new Map();
 * map.set(3, new Map());
 * map.get(3).set("hi", 7);
 * // map is Map { 3 -> Map { "hi" -> 7 } }
 *
 * deepDeleteResult(map, 3, "hi"); // Ok(7)
 * // map is Map { 3 -> Map {} }
 *
 * deepDeleteResult(map, 3, "hi"); // Err(undefined)
 * ```
 *
 * @public
 */
function deepDeleteResult<
  M extends DeepMapLike<K>,
  K extends [unknown, ...unknown[]]
>(map: M, ...keys: K): Result<DeepValue<M, K>, undefined> {
  const result = deepTraverse(map, keys.slice(0, -1));
  if (!result.ok) {
    return result;
  }
  return deleteResult(result.value, keys[keys.length - 1]);
}

/**
 * Like
 * [Map.get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get),
 * but use a sequence of keys to get a value from a nested map.
 *
 * @example
 * ```ts
 * const map: Map<number, Map<string, number>> = new Map();
 * map.set(3, new Map());
 * map.get(3).set("hi", 7);
 * // map is Map { 3 -> Map { "hi" -> 7 } }
 *
 * deepGet(map, 3, "hi"); // 7
 * deepGet(map, 3, "oops"); // undefined
 * deepGet(map, 4, "hi"); // undefined
 * ```
 *
 * @public
 */
function deepGet<M extends DeepMapLike<K>, K extends [unknown, ...unknown[]]>(
  map: M,
  ...keys: K
): DeepValue<M, K> | undefined {
  return deepGetResult(map, ...keys).valueOr(undefined);
}

/**
 * Like {@link deepGet}, but return an {@link Ok} with the retrieved value, or
 * an {@link Err} if the entry does not exist.
 *
 * @example
 * ```ts
 * const map: Map<number, Map<string, number>> = new Map();
 * map.set(3, new Map());
 * map.get(3).set("hi", 7);
 * // map is Map { 3 -> Map { "hi" -> 7 } }
 *
 * deepGetResult(map, 3, "hi"); // Ok(7)
 * deepGetResult(map, 3, "oops"); // Err(undefined)
 * deepGetResult(map, 4, "hi"); // Err(undefined)
 * ```
 *
 * @public
 */
function deepGetResult<
  M extends DeepMapLike<K>,
  K extends [unknown, ...unknown[]]
>(map: M, ...keys: K): Result<DeepValue<M, K>, undefined> {
  const result = deepTraverse(map, keys.slice(0, -1));
  if (!result.ok) {
    return result;
  }
  return getResult(result.value, keys[keys.length - 1]);
}

/**
 * Like
 * [Map.has](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has),
 * but use a sequence of keys to access a nested map.
 *
 * @example
 * ```ts
 * const map: Map<number, Map<string, number>> = new Map();
 * map.set(3, new Map());
 * map.get(3).set("hi", 7);
 * // map is Map { 3 -> Map { "hi" -> 7 } }
 *
 * deepHas(map, 3, "hi"); // true
 * deepHas(map, 3, "oops"); // false
 * deepHas(map, 4, "hi"); // false
 * ```
 *
 * @public
 */
function deepHas<M extends DeepMapLike<K>, K extends [unknown, ...unknown[]]>(
  map: M,
  ...keys: K
): boolean {
  return deepGetResult(map, ...keys).ok;
}

/**
 * Like
 * [Map.set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set),
 * but use a sequence of keys to access a nested map.
 *
 * @example
 * ```ts
 * const map: Map<number, Map<string, number>> = new Map();
 * deepSet(map, 3, "hi", 7);
 * // map is Map { 3 -> Map { "hi" -> 7 } }
 *
 * deepSet(map, 4, new Map());
 * // map is Map { 3 -> Map { "hi" -> 7 }, 4 -> Map {} }
 * ```
 *
 * New nested
 * [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s
 * are constructed and inserted as necessary. Thus, all of the nested maps must
 * be Maps specifically.
 *
 * If your nested maps are not Maps, you can use {@link getOrSetComputed} to
 * accomplish the same thing:
 *
 * ```ts
 * const map: WeakMap<object, WeakMap<object, number>> = new WeakMap();
 * const firstKey = {};
 * const secondKey = {};
 * const value = 5;
 * getOrSetComputed(map, firstKey, () => new WeakMap()).set(secondKey, value);
 * ```
 *
 * @public
 */
function deepSet<M extends DeepMap<K>, K extends [unknown, ...unknown[]]>(
  map: M,
  ...keysAndValue: [...K, DeepValue<M, K>]
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: MapLike<any, any> = map;
  for (let i = 0; i < keysAndValue.length - 2; i++) {
    const key = keysAndValue[i];
    current = getOrSetComputed(current, key, () => new Map());
  }
  current.set(
    keysAndValue[keysAndValue.length - 2],
    keysAndValue[keysAndValue.length - 1]
  );
}

/**
 * Utility functions for manipulating
 * [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s,
 * [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)s,
 * and other {@link MapLike}s.
 *
 * These functions can be imported directly, or accessed as properties of `MapUtils`:
 *
 * ```ts
 * const nestedMap: Map<number, Map<string, number>> = new Map();
 *
 * import { deepSet } from "typesafer";
 * deepSet(nestedMap, 3, "hi", 7); // Map { 3 -> Map { "hi" -> 7 } }
 *
 * // alternatively:
 * import { MapUtils } from "typesafer";
 * MapUtils.deepSet(nestedMap, 3, "hi", 7); // Map { 3 -> Map { "hi" -> 7 } }
 * ```
 *
 * @public
 */
const MapUtils = {
  deleteResult,
  deepDelete,
  deepDeleteResult,
  deepGet,
  deepGetResult,
  deepHas,
  deepSet,
  getOrSet,
  getOrSetComputed,
  getResult,
} as const;

export {
  MapLike,
  MapUtils,
  deleteResult,
  deepDelete,
  deepDeleteResult,
  deepGet,
  deepGetResult,
  deepHas,
  deepSet,
  getOrSet,
  getOrSetComputed,
  getResult,
};
