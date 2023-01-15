## API Reference

- [Baking](#baking)
  - [`bake`](#bake)
  - [`Bakeable`](#bakeable)
  - [`ObjectBakeable`](#objectbakeable)
  - [`Baked`](#baked)
- [Cakes](#cakes)
  - [`Cake`](#cake)
  - [`Cake.as`](#cakeas)
  - [`Cake.check`](#cakecheck)
  - [`Cake.is`](#cakeis)
  - [`Cake.toString`](#caketostring)
  - [`Infer`](#infer)
- [Built-in Cakes](#built-in-cakes)
  - [`any`](#any)
  - [`boolean`](#boolean)
  - [`bigint`](#bigint)
  - [`never`](#never)
  - [`number`](#number)
  - [`string`](#string)
  - [`symbol`](#symbol)
  - [`unknown`](#unknown)
- [Tags](#tags)
  - [`optional`](#optional)
  - [`OptionalTag`](#optionaltag)
- [Cake Errors](#cake-errors)
  - [`CakeError`](#cakeerror)
- [Comparison Utilities](#comparison-utilities)
  - [`sameValueZero`](#samevaluezero)
- [Map Utilities](#map-utilities)
  - [`MapLike`](#maplike)
  - [`deleteResult`](#deleteresult)
  - [`getResult`](#getresult)
  - [`getOrSet`](#getorset)
  - [`getOrSetComputed`](#getorsetcomputed)
  - [`deepDelete`](#deepdelete)
  - [`deepDeleteResult`](#deepdeleteresult)
  - [`deepGet`](#deepget)
  - [`deepGetResult`](#deepgetresult)
  - [`deepHas`](#deephas)
  - [`deepSet`](#deepset)
- [Object Utilities](#object-utilities)
  - [`Entry`](#entry)
  - [`EntryIncludingSymbols`](#entryincludingsymbols)
  - [`entries`](#entries)
  - [`entriesUnsound`](#entriesunsound)
  - [`entriesIncludingSymbols`](#entriesincludingsymbols)
  - [`entriesIncludingSymbolsUnsound`](#entriesincludingsymbolsunsound)
  - [`keys`](#keys)
  - [`keysUnsound`](#keysunsound)
  - [`keysIncludingSymbols`](#keysincludingsymbols)
  - [`keysIncludingSymbolsUnsound`](#keysincludingsymbolsunsound)
  - [`values`](#values)
  - [`valuesUnsound`](#valuesunsound)
  - [`valuesIncludingSymbols`](#valuesincludingsymbols)
  - [`valuesIncludingSymbolsUnsound`](#valuesincludingsymbolsunsound)
  - [`mapValues`](#mapvalues)
  - [`mapValuesUnsound`](#mapvaluesunsound)
  - [`lookup`](#lookup)
  - [`merge`](#merge)
  - [`omit`](#omit)
  - [`omitLoose`](#omitloose)
  - [`pick`](#pick)
- [Primitives](#primitives)
  - [`Primitive`](#primitive)
  - [`isPrimitive`](#isprimitive)
  - [`stringifyPrimitive`](#stringifyprimitive)
- [Results](#results)
  - [`Result`](#result)
  - [`Result.ok`](#resultok)
  - [`Result.err`](#resulterr)
  - [`Result.valueOr`](#resultvalueor)
  - [`Result.errorOr`](#resulterroror)
  - [`Result.toString`](#resulttostring)
  - [`Ok`](#ok)
  - [`Ok.ok`](#okok)
  - [`Ok.value`](#okvalue)
  - [`Err`](#err)
  - [`Err.ok`](#errok)
  - [`Err.error`](#errerror)
- [Type-level Assertions](#type-level-assertions)
  - [`Assert`](#assert)
  - [`AssertExtends`](#assertextends)
  - [`Equivalent`](#equivalent)
  - [`Extends`](#extends)
  - [`If`](#if)
  - [`Not`](#not)
- [Utility Types](#utility-types)
  - [`Class`](#class)

---

### BAKING

---

#### `bake`

Create a [Cake](#cake) from a [Bakeable](#bakeable) type definition.

```ts
const Person = bake({
  name: string,
  age: optional(number),
} as const);

const aliceIsPerson = Person.is({ name: "Alice" });
// true
```

Use [Infer](#infer) to get the TypeScript type represented by a Cake:

```ts
type Person = Infer<typeof Person>;
// { name: string, age?: number | undefined }

const bob: Person = { name: "Bob", age: 42 };
```

---

#### `Bakeable`

A convenient syntax for type definitions. Used by [bake](#bake).

```ts
type Bakeable = Cake | ObjectBakeable;

type ObjectBakeable = {
  [key: string | symbol]: Bakeable | OptionalTag<Bakeable>;
};
```

---

#### `Baked`

The return type of [bake](#bake) for a given [Bakeable](#bakeable).

---

### CAKES

---

#### `Cake`

Represent a TypeScript type at runtime.

```ts
abstract class Cake<in out T = any>
```

> `T`: The TypeScript type represented by this Cake.

See [bake](#bake) to create a Cake.

---

#### `Cake.as`

Return the provided value if it satisfies the type represented by this
Cake, and throw a TypeError otherwise.

```ts
Cake<T>.as(value: unknown): T;
```

Using the built-in [number](#number) Cake:

```ts
number.as(3); // 3

number.as("oops");
// TypeError: Value does not satisfy type 'number': type guard failed.
```

See [Cake.check](#cakecheck) to return the error instead of throwing it.

---

#### `Cake.check`

Return a [Result](#result) with the provided value if it satisfies the type
represented by this Cake, or a [CakeError](#cakeerror) otherwise.

```ts
Cake<T>.check(value: unknown): Result<T, CakeError>;
```

Using the built-in [number](#number) Cake:

```ts
function square(input: unknown) {
  const result = number.check(input);
  if (result.ok) {
    // result.value is a number
    return result.value ** 2;
  } else {
    // result.error is a CakeError
    console.error(result.error);
  }
}

square(3); // 9

square("oops");
// Value does not satisfy type 'number': type guard failed.
```

[Result.valueOr](#resultvalueor) can be used to return a default value when
the provided value is invalid:

```ts
number.check(3).valueOr(0); // 3
number.check("oops").valueOr(0); // 0
```

[Result.errorOr](#resulterroror) can be used to get the [CakeError](#cakeerror)
directly, or a default value if no error occurred:

```ts
number.check(3).errorOr(null); // null
number.check("oops").errorOr(null); // <CakeError>
```

See [Cake.as](#cakeas) to throw an error if the type is not satisfied.

---

#### `Cake.is`

Return whether a value satisfies the type represented by this Cake.

```ts
Cake<T>.is(value: unknown): value is T;
```

Using the built-in [number](#number) Cake:

```ts
number.is(3); // true
number.is("oops"); // false
```

This can be used as a
[type guard](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
for control flow narrowing:

```ts
const value: unknown = 7;
if (number.is(value)) {
  // here, value has type 'number'
}
```

---

#### `Cake.toString`

Return a human-readable string representation of the type represented by
this Cake.

```ts
const Person = bake({
  name: string,
  height: optional(number),
} as const);

Person.toString();
// {name: string, height?: (number) | undefined}
```

The string representation is designed to be unambiguous and simple to
generate, so it may contain redundant parentheses.

The format of the return value may change between versions.

---

#### `Infer`

_type_

Get the TypeScript type represented by a [Cake](#cake).

```ts
const Person = bake({
  name: string,
  age: optional(number),
} as const);

type Person = Infer<typeof Person>;
// { name: string, age?: number | undefined }
```

---

### BUILT-IN CAKES

---

#### `any`

A [Cake](#cake) representing the `any` type. Every value satisfies this type.

```ts
any.is("hello"); // true
any.is(null); // true
```

See [unknown](#unknown) to get the same runtime behavior, but an inferred type
of `unknown` instead of `any`.

---

#### `boolean`

A [Cake](#cake) representing the `boolean` type.

```ts
boolean.is(true); // true
boolean.is(1); // false
```

---

#### `bigint`

A [Cake](#cake) representing the `bigint` type.

```ts
bigint.is(BigInt(5)); // true
bigint.is(5); // false
```

---

#### `never`

A [Cake](#cake) representing the `never` type. No value satisfies this type.

```ts
never.is("hello"); // false
never.is(undefined); // false
```

---

#### `number`

A [Cake](#cake) representing the `number` type.

```ts
number.is(5); // true
number.is("5"); // false
```

---

#### `string`

A [Cake](#cake) representing the `string` type.

```ts
string.is("hello"); // true
string.is(""); // true
```

---

#### `symbol`

A [Cake](#cake) representing the `symbol` type.

```ts
symbol.is(Symbol.iterator); // true
symbol.is(Symbol("hi")); // true
```

---

#### `unknown`

A [Cake](#cake) representing the `unknown` type. Every value satisfies this
type.

```ts
unknown.is("hello"); // true
unknown.is(null); // true
```

See [any](#any) to get the same runtime behavior, but an inferred type
of `any` instead of `unknown`.

---

### TAGS

---

#### `optional`

Used to indicate that a property is optional.

```ts
const Person = bake({
  name: string,
  age: optional(number),
} as const);

type Person = Infer<typeof Person>;
// { name: string, age?: number | undefined }
```

---

#### `OptionalTag`

Returned by [optional](#optional).

---

### CAKE ERRORS

---

#### `CakeError`

Represent the reason why a value did not satisfy the type represented by a
[Cake](#cake).

---

#### `CakeError.throw`

Throw a TypeError created from this CakeError.

```ts
error.throw();
// TypeError: Value does not satisfy type '{name: string}': object properties are invalid.
//   Property "name": Required property is missing.
```

---

#### `CakeError.toString`

Return a human-readable string representation of this CakeError.

```ts
console.log(error.toString());
// Value does not satisfy type '{name: string}': object properties are invalid.
//   Property "name": Required property is missing.
```

---

### COMPARISON UTILITIES

---

#### `sameValueZero`

Return whether two values are equal, using the
[SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)
equality algorithm.

This has almost the same behavior as `===`, except it considers `NaN` equal
to `NaN`.

```ts
sameValueZero(3, 3); // true
sameValueZero(0, false); // false
sameValueZero(0, -0); // true
sameValueZero(NaN, NaN); // true
```

---

### MAP UTILITIES

Utility functions for manipulating
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s,
[WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)s,
and other [MapLike](#maplike)s.

These functions can be imported directly, or accessed as properties of `MapUtils`:

```ts
const nestedMap: Map<number, Map<string, number>> = new Map();

import { deepSet } from "caketype";
deepSet(nestedMap, 3, "hi", 7); // Map { 3 -> Map { "hi" -> 7 } }

// alternatively:
import { MapUtils } from "caketype";
MapUtils.deepSet(nestedMap, 3, "hi", 7); // Map { 3 -> Map { "hi" -> 7 } }
```

---

#### `MapLike`

Common interface for
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s
and
[WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)s.

```ts
interface MapLike<K, V> {
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): MapLike<K, V>;
}
```

---

#### `deleteResult`

Like
[Map.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete),
but return an [Ok](#ok) with the value of the deleted entry, or an
[Err](#err) if the entry does not exist.

```ts
const map: Map<number, string> = new Map();
map.set(3, "hi");

deleteResult(map, 3); // Ok("hi")
// map is empty now

deleteResult(map, 3); // Err(undefined)
```

---

#### `getResult`

Like
[Map.get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get),
but return an [Ok](#ok) with the retrieved value, or an [Err](#err) if the
entry does not exist.

```ts
const map: Map<number, string> = new Map();
map.set(3, "hi");

getResult(map, 3); // Ok("hi")
getResult(map, 4); // Err(undefined)
```

---

#### `getOrSet`

If the map has an entry with the provided key, return the existing value.
Otherwise, insert an entry with the provided key and default value, and
return the inserted value.

```ts
const map: Map<number, string> = new Map();
map.set(3, "hi");

getOrSet(map, 3, "default"); // "hi"
// map is unchanged

getOrSet(map, 4, "default"); // "default"
// map is now Map { 3 -> "hi", 4 -> "default" }
```

See [getOrSetComputed](#getorsetcomputed) to avoid constructing a default value if the
key is present.

---

#### `getOrSetComputed`

If the map has an entry with the provided key, return the existing value.
Otherwise, use the callback to compute a new value, insert an entry with the
provided key and computed value, and return the inserted value.

```ts
const map: Map<string, string[]> = new Map();

getOrSetComputed(map, "alice", () => []).push("bob");
// "alice" is not present, so the value [] is computed and returned
// then "bob" is added to the returned array
// map is now Map { "alice" -> ["bob"] }

getOrSetComputed(map, "alice", () => []).push("cindy");
// "alice" is present, so the existing array ["bob"] is returned
// then "cindy" is added to the returned array
// map is now Map { "alice" -> ["bob", "cindy"] }
```

The callback can use the map key to compute the new value:

```ts
const map: Map<string, string[]> = new Map();

getOrSetComputed(map, "alice", (name) => [name]).push("bob");
// "alice" is not present, so the value ["alice"] is computed and returned
// then "bob" is added to the returned array
// map is now Map { "alice" -> ["alice", "bob"] }
```

See [getOrSet](#getorset) to use a constant instead of a computed value.

---

#### `deepDelete`

Like
[Map.delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete),
but use a sequence of keys to delete an entry from a nested map.

```ts
const map: Map<number, Map<string, number>> = new Map();
map.set(3, new Map());
map.get(3).set("hi", 7);
// map is Map { 3 -> Map { "hi" -> 7 } }

deepDelete(map, 3, "hi"); // true
// map is Map { 3 -> Map {} }

deepDeleteResult(map, 3, "hi"); // false
```

---

#### `deepDeleteResult`

Like [deepDelete](#deepdelete), but return an [Ok](#ok) with the value of the
deleted entry, or [Err](#err) if the entry does not exist.

```ts
const map: Map<number, Map<string, number>> = new Map();
map.set(3, new Map());
map.get(3).set("hi", 7);
// map is Map { 3 -> Map { "hi" -> 7 } }

deepDeleteResult(map, 3, "hi"); // Ok(7)
// map is Map { 3 -> Map {} }

deepDeleteResult(map, 3, "hi"); // Err(undefined)
```

---

#### `deepGet`

Like
[Map.get](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get),
but use a sequence of keys to get a value from a nested map.

```ts
const map: Map<number, Map<string, number>> = new Map();
map.set(3, new Map());
map.get(3).set("hi", 7);
// map is Map { 3 -> Map { "hi" -> 7 } }

deepGet(map, 3, "hi"); // 7
deepGet(map, 3, "oops"); // undefined
deepGet(map, 4, "hi"); // undefined
```

---

#### `deepGetResult`

Like [deepGet](#deepget), but return an [Ok](#ok) with the retrieved value, or
an [Err](#err) if the entry does not exist.

```ts
const map: Map<number, Map<string, number>> = new Map();
map.set(3, new Map());
map.get(3).set("hi", 7);
// map is Map { 3 -> Map { "hi" -> 7 } }

deepGetResult(map, 3, "hi"); // Ok(7)
deepGetResult(map, 3, "oops"); // Err(undefined)
deepGetResult(map, 4, "hi"); // Err(undefined)
```

---

#### `deepHas`

Like
[Map.has](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has),
but use a sequence of keys to access a nested map.

```ts
const map: Map<number, Map<string, number>> = new Map();
map.set(3, new Map());
map.get(3).set("hi", 7);
// map is Map { 3 -> Map { "hi" -> 7 } }

deepHas(map, 3, "hi"); // true
deepHas(map, 3, "oops"); // false
deepHas(map, 4, "hi"); // false
```

---

#### `deepSet`

Like
[Map.set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set),
but use a sequence of keys to access a nested map.

```ts
const map: Map<number, Map<string, number>> = new Map();
deepSet(map, 3, "hi", 7);
// map is Map { 3 -> Map { "hi" -> 7 } }

deepSet(map, 4, new Map());
// map is Map { 3 -> Map { "hi" -> 7 }, 4 -> Map {} }
```

New nested
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)s
are constructed and inserted as necessary. Thus, all of the nested maps must
be Maps specifically.

If your nested maps are not Maps, you can use [getOrSetComputed](#getorsetcomputed) to
accomplish the same thing:

```ts
const map: WeakMap<object, WeakMap<object, number>> = new WeakMap();
const firstKey = {};
const secondKey = {};
const value = 5;
getOrSetComputed(map, firstKey, () => new WeakMap()).set(secondKey, value);
```

---

### OBJECT UTILITIES

Utility functions for manipulating objects.

These functions can be imported directly, or accessed as properties of
`ObjectUtils`:

```ts
import { merge } from "caketype";
merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }

// alternatively:
import { ObjectUtils } from "caketype";
ObjectUtils.merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
```

---

#### `Entry`

Get the type of an object's entries.

```ts
type Person = { name: string; age: number };
type PersonEntry = Entry<Person>;
// ["name", string] | ["age", number]
```

See [entriesUnsound](#entriesunsound) to get these entries from an object at runtime.

---

#### `EntryIncludingSymbols`

Get the type of an object's entries, and include entries with symbol keys
too.

```ts
const sym = Symbol("my symbol");
type Example = { age: number; [sym]: boolean };
type ExampleEntry = EntryIncludingSymbols<Example>;
// ["age", number] | [typeof sym, boolean]
```

See [entriesIncludingSymbolsUnsound](#entriesincludingsymbolsunsound) to get these entries from an
object at runtime.

---

#### `entries`

Alias for
[Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
with a sound type signature.

See [entriesUnsound](#entriesunsound) to infer a more specific type for the entries
when all of the object's properties are declared in its type.

See [this issue](https://github.com/microsoft/TypeScript/issues/38520)
explaining why Object.entries is unsound.

---

#### `entriesUnsound`

Like
[Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries),
but use the object type to infer the type of the entries.

This is unsound unless all of the object's own enumerable string-keyed
properties are declared in its type. If a property is not declared in the
object type, its entry will not appear in the return type, but the entry will
still be returned at runtime.

If a property is not enumerable, its entry will not be returned at runtime,
even if its entry appears in the return type.

---

#### `entriesIncludingSymbols`

Return the entries of an object's own enumerable properties.

This differs from
[Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
by including properties with symbol keys.

See [entriesIncludingSymbolsUnsound](#entriesincludingsymbolsunsound) to infer a more specific type
for the entries when all of the object's properties are declared in its type.

---

#### `entriesIncludingSymbolsUnsound`

Like [entriesIncludingSymbols](#entriesincludingsymbols), but use the object type to infer
the type of the entries.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
entry will not appear in the return type, but the entry will still be
returned at runtime.

If a property is not enumerable, its entry will not be returned at runtime,
even if its entry appears in the return type.

---

#### `keys`

Alias for
[Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).

See [keysUnsound](#keysunsound) to infer a more specific type for the keys when all
of the object's properties are declared in its type.

---

#### `keysUnsound`

Like
[Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys),
but use the object type to infer the type of the
keys.

This is unsound unless all of the object's own enumerable string-keyed
properties are declared in its type. If a property is not declared in the
object type, its key will not appear in the return type, but the key will
still be returned at runtime.

If a property is not enumerable, its key will not be returned at runtime,
even if its key appears in the return type.

---

#### `keysIncludingSymbols`

Return the string and symbol keys of an object's own enumerable properties.

This differs from
[Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
by including symbol keys, and it differs from
[Reflect.ownKeys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys)
by excluding the keys of non-enumerable properties.

See [keysIncludingSymbolsUnsound](#keysincludingsymbolsunsound) to infer a more specific type for
the keys when all of the object's properties are declared in its type.

---

#### `keysIncludingSymbolsUnsound`

Like [keysIncludingSymbols](#keysincludingsymbols), but use the object type to infer the type
of the keys.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
key will not appear in the return type, but the key will still be returned at
runtime.

If a property is not enumerable, its key will not be returned at runtime,
even if its key appears in the return type.

---

#### `values`

Alias for
[Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
with a sound type signature.

See [valuesUnsound](#valuesunsound) to infer a more specific type for the values when
all of the object's properties are declared in its type.

See [this issue](https://github.com/microsoft/TypeScript/issues/38520)
explaining why
[Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
is unsound.

---

#### `valuesUnsound`

Like
[Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values),
but use the object type to infer the type of the values.

This is unsound unless all of the object's own enumerable string-keyed
properties are declared in its type. If a property is not declared in the
object type, its value will not appear in the return type, but the value will
still be returned at runtime.

If a property is not enumerable, its value will not be returned at runtime,
even if its value appears in the return type.

---

#### `valuesIncludingSymbols`

Return the values of an object's own enumerable properties.

This differs from
[Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
by including properties with symbol keys.

---

#### `valuesIncludingSymbolsUnsound`

Like [valuesIncludingSymbols](#valuesincludingsymbols), but use the object type to infer the
type of the values.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
value will not appear in the return type, but the value will still be
returned at runtime.

If a property is not enumerable, its value will not be returned at runtime,
even if its value appears in the return type.

---

#### `mapValues`

Return a new object created by mapping the enumerable own property values of
an existing object. This is analogous to
[Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

See [mapValuesUnsound](#mapvaluesunsound) to infer more specific types for the keys and
values when all of the object's properties are declared in its type.

---

#### `mapValuesUnsound`

Like [mapValues](#mapvalues), but use the object type to infer the types of the
values and keys.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
key and value cannot be type-checked against the function parameter types,
but the function will still be called with that key and value at runtime.

---

#### `lookup`

Find the first object with the given key set to a non-`undefined` value, and
return that value. If none of the objects have a non-`undefined` value,
return `undefined`.

```ts
lookup("a", { a: 1 }, { a: 2 }); // 1
lookup("a", { a: undefined }, { a: 2 }); // 2
lookup("a", {}, { a: 2 }); // 2
lookup("a", {}, {}); // undefined
```

If the objects contain properties that are not declared in their
types, the inferred return type could be incorrect. This is because an
undeclared property can take precedence over a declared property on a later
object:

```ts
const aNumber = { value: 3 };
const aString = { value: "hi" };

// property 'value' is not declared in type, but present at runtime
const propertyNotDeclared: {} = aString;

const wrong: number = lookup("value", propertyNotDeclared, aNumber);
// no type errors, but at runtime, wrong is "hi"
```

---

#### `merge`

Return a new object created by merging the enumerable own properties of the
provided objects, skipping properties that are explicitly set to `undefined`.

```ts
merge({ a: 1, b: 2, c: 3 }, { a: 99, b: undefined });
// { a: 99, b: 2, c: 3 }
```

If the objects contain properties that are not declared in their
types, the inferred type of the merged object could be incorrect. This is
because an undeclared property can replace a declared property from a
preceding object:

```ts
const aNumber = { value: 3 };
const aString = { value: "hi" };

// property 'value' is not declared in type, but present at runtime
const propertyNotDeclared: {} = aString;

const wrong: { value: number } = merge(aNumber, propertyNotDeclared);
// no type errors, but at runtime, wrong is { value: "hi" }
```

_Remarks_

By default, TypeScript allows optional properties to be explicitly set to
`undefined`. When merging partial objects, it's often desirable to skip
properties that are set to `undefined` in order to use a default value:

```ts
const defaults = { muted: false, volume: 20 };
const muted = merge(defaults, { muted: true, volume: undefined });
// { muted: true, volume: 20 }
```

[Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
and
[object spreading](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals)
do not give the desired result:

```ts
const wrong1 = { ...defaults, ...{ muted: true, volume: undefined } };
// { muted: true, volume: undefined }
```

If the TypeScript flag
[exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes)
is not enabled, then `undefined` can be assigned to any optional property,
and object spreading is unsound:

```ts
type Config = { muted: boolean; volume: number };
const overrides: Partial<Config> = { muted: true, volume: undefined };
const wrong2: Config = { ...defaults, ...overrides };

const volume: number = wrong2.volume;
// no type errors, but at runtime, volume is undefined
```

---

#### `omit`

Return a new object created by copying the enumerable own properties of a
source object, but omitting the properties with the specified keys.

See [omitLoose](#omitloose) to allow keys that are not `keyof T`.

---

#### `omitLoose`

Return a new object created by copying the enumerable own properties of a
source object, but omitting the properties with the specified keys.

The type of the returned object will be inaccurate if any of the keys are not
literal strings or unique symbols. For example, providing a key with type
`string` will omit all string-keyed properties from the type of the returned
object. This type inference limitation does not affect the runtime behavior.

See [omit](#omit) to restrict the keys to `keyof T`.

---

#### `pick`

Return a new object created by copying the properties of a source object with
the specified keys.

Non-enumerable properties are copied from the source object, but the
properties will be enumerable in the returned object.

---

### PRIMITIVES

---

#### `Primitive`

A JavaScript
[primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

```ts
type Primitive = bigint | boolean | number | string | symbol | null | undefined;
```

---

#### `isPrimitive`

Return whether a value is a [Primitive](#primitive).

```ts
isPrimitive(5); // true
isPrimitive([]); // false
```

---

#### `stringifyPrimitive`

Return a string representation of a [Primitive](#primitive) that resembles how it
would be written as a literal in source code.

```ts
console.log(stringifyPrimitive(BigInt(-27))); // -27n
console.log(stringifyPrimitive("hi\nbye")); // "hi\nbye"
// Symbols are unique, so they cannot be recreated
// by evaluating their string representation:
console.log(stringifyPrimitive(Symbol("apple"))); // Symbol(apple)
```

---

### RESULTS

---

#### `Result`

Represent the result of an operation that could succeed or fail.

```ts
type Result<T, E> = Ok<T> | Err<E>;
```

This is a
[discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions),
where [Ok](#ok) represents a successful result, and [Err](#err) represents
an unsuccessful result.

Using an existing Result:

```ts
function showDecimal(input: string): string {
  const result: Result<number, string> = parseBinary(input);
  // result is Ok<number> | Err<string>
  if (result.ok) {
    // result is Ok<number>, so result.value is a number
    return `binary ${input} is decimal ${result.value}`;
  } else {
    // result is Err<string>, so result.error is a string
    return `not a binary number: ${result.error}`;
  }
}

showDecimal("101"); // "binary 101 is decimal 5"
showDecimal("foo"); // "not a binary number: invalid character"
showDecimal(""); // "not a binary number: empty string"
```

Creating Results:

```ts
function parseBinary(input: string): Result<number, string> {
  if (input.length === 0) {
    return Result.err("empty string");
  }
  let num = 0;
  for (const char of input) {
    if (char === "0") {
      num = num * 2;
    } else if (char === "1") {
      num = num * 2 + 1;
    } else {
      return Result.err("invalid character");
    }
  }
  return Result.ok(num);
}

parseBinary("101"); // Ok(5)
parseBinary("foo"); // Err(invalid character)
parseBinary(""); // Err(empty string)
```

---

#### `Result.ok`

_function_

Return an [Ok](#ok) with the provided value, using undefined if no value is
provided.

```ts
Result.ok(5); // Ok(5)
Result.ok(); // Ok(undefined)
```

---

#### `Result.err`

_function_

Return an [Err](#err) with the provided error, using undefined if no error is
provided.

```ts
Result.err("oops"); // Err(oops)
Result.err(); // Err(undefined)
```

---

#### `Result.valueOr`

_method_

Return [Ok.value](#okvalue), or the provided argument if this is not an Ok.

```ts
Result.ok(5).valueOr(0); // 5
Result.err("oops").valueOr(0); // 0
```

---

#### `Result.errorOr`

_method_

Return [Err.error](#errerror), or the provided argument if this is not an Err.

```ts
Result.err("oops").errorOr("no error"); // "oops"
Result.ok(5).errorOr("no error"); // "no error"
```

---

#### `Result.toString`

_method_

Return a string representation of this Result.

```ts
Result.ok(5).toString(); // "Ok(5)"
Result.err({}).toString(); // "Err([object Object])"
```

---

#### `Ok`

_class_

The result of a successful operation.

See [Result.ok](#resultok) to construct an Ok.

---

#### `Ok.ok`

_property_

Always true. In contrast, [Err.ok](#errok) is always false.

---

#### `Ok.value`

_property_

The value returned by the successful operation.

---

#### `Err`

_class_

The result of an unsuccessful operation.

See [Result.err](#resulterr) to construct an Err.

---

#### `Err.ok`

_property_

Always false. In contrast, [Ok.ok](#okok) is always true.

---

#### `Err.error`

_property_

The value returned by the unsuccessful operation.

---

### TYPE-LEVEL ASSERTIONS

Inspect and assert relationships between types. For example, you can
assert that one type extends another, or that two types are equivalent.

This can be used to test complex conditional types and type inference.

---

#### `Assert`

Assert that the type argument is always true, or cause a type error
otherwise.

```ts
type Assert<T extends true> = never;
```

Typically used with [Equivalent](#equivalent), or another generic type that returns
a boolean.

```ts
type _pass = Assert<Equivalent<string["length"], number>>;
// OK: Equivalent<string["length"], number> is true

type _fail = Assert<Equivalent<string, number>>;
// Type error: Equivalent<string, number> is false
```

See [AssertExtends](#assertextends) to get more specific error messages if you are
asserting that one type extends another.

---

#### `AssertExtends`

Assert that `T` extends `U`.

```ts
type AssertExtends<T extends U, U> = never;
```

_Example_

```ts
type _pass = AssertExtends<3, number>;
// OK: 3 extends number

type _fail = AssertExtends<number, 3>;
// Type error: 'number' does not satisfy '3'
```

This behaves like [Assert](#assert) combined with [Extends](#extends), but it uses
generic constraints so you can get more specific error messages from the
TypeScript compiler.

---

#### `Equivalent`

If `T` and `U` extend each other, return true. Otherwise, return false.

```ts
type Equivalent<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;
```

_Example_

```ts
type _true = Equivalent<string["length"], number>; // true

type _false = Equivalent<3, number>;
// false: 3 extends number, but number does not extend 3
```

---

#### `Extends`

If `T` extends `U`, return true. Otherwise, return false.

```ts
type Extends<T, U> = [T] extends [U] ? true : false;
```

_Example_

```ts
type _ = Assert<Not<Extends<number, 3>>>;
// OK: number does not extend 3
```

See [AssertExtends](#assertextends) to get more specific error messages if you are
asserting that one type extends another.

---

#### `If`

If `T` is true, return `U`. Otherwise, return `V`.

```ts
type If<T extends boolean, U, V> = T extends true ? U : V;
```

_Example_

```ts
type _apple = If<true, "apple", "banana">; // "apple"

type _either = If<true | false, "apple", "banana">;
// "apple" | "banana"
```

---

#### `Not`

Return the boolean negation of the type argument.

```ts
type Not<T extends boolean> = T extends true ? false : true;
```

_Example_

```ts
type _false = Not<true>; // false

type _boolean = Not<boolean>;
// negation of true | false is false | true
```

---

### UTILITY TYPES

---

#### `Class`

The type of a class (something that can be called with `new` to construct
an instance).

```ts
interface Class<T = any, A extends unknown[] = any>
```

> `T` - Type of the class instances.
>
> `A` - Type of the constructor arguments.

_Example_

```ts
// Any class.
const a: Class[] = [Date, Array, RegExp];

// A class whose instance type is Date.
const b: Class<Date> = Date;

// A class whose instance type is Date, and whose
// constructor can be called with one number argument.
const c: Class<Date, [number]> = Date;
```

## Changelog

### v0.2.0 - 2023-01-11

#### Added

- [sameValueZero](#samevaluezero) utility function
- [Map Utilities](#map-utilities)
- [Object Utilities](#object-utilities)
- [Primitives](#primitives)
- [Results](#results)
- [Type-Level Assertions](#type-level-assertions)
- [Class](#class) utility type
