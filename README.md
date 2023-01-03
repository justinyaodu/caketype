## API Reference

### Object Utilities

Utility functions for manipulating objects.

These functions can be imported directly, or accessed as properties of
`ObjectUtils`:

```ts
import { merge } from "typesafer";
merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }

// Alternatively:
import { ObjectUtils } from "typesafer";
ObjectUtils.merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
```

#### `Entry`

Get the type of an object's entries.

```ts
type Person = { name: string; age: number };
type PersonEntry = Entry<Person>;
// ["name", string] | ["age", number]
```

See [entriesUnsound](#entriesUnsound) to get these entries from an object at runtime.

#### `EntryIncludingSymbols`

Get the type of an object's entries, and include entries with symbol keys
too.

```ts
const sym = Symbol("my symbol");
type Example = { age: number; [sym]: boolean };
type ExampleEntry = EntryIncludingSymbols<Example>;
// ["age", number] | [typeof sym, boolean]
```

See [entriesIncludingSymbolsUnsound](#entriesIncludingSymbolsUnsound) to get these entries from an
object at runtime.

#### `entries`

Alias for
[Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
with a sound type signature.

See [entriesUnsound](#entriesUnsound) to infer a more specific type for the entries
when all of the object's properties are declared in its type.
See [this issue](https://github.com/microsoft/TypeScript/issues/38520)
explaining why Object.entries is unsound.

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

#### `entriesIncludingSymbols`

Return the entries of an object's own enumerable properties.

This differs from
[Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)
by including properties with symbol keys.

See [entriesIncludingSymbolsUnsound](#entriesIncludingSymbolsUnsound) to infer a more specific type
for the entries when all of the object's properties are declared in its type.

#### `entriesIncludingSymbolsUnsound`

Like [entriesIncludingSymbols](#entriesIncludingSymbols), but use the object type to infer
the type of the entries.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
entry will not appear in the return type, but the entry will still be
returned at runtime.

If a property is not enumerable, its entry will not be returned at runtime,
even if its entry appears in the return type.

#### `keys`

Alias for
[Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys).

See [keysUnsound](#keysUnsound) to infer a more specific type for the keys when all
of the object's properties are declared in its type.

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

#### `keysIncludingSymbols`

Return the string and symbol keys of an object's own enumerable properties.

This differs from
[Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
by including symbol keys, and it differs from
[Reflect.ownKeys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys)
by excluding the keys of non-enumerable properties.

See [keysIncludingSymbolsUnsound](#keysIncludingSymbolsUnsound) to infer a more specific type for
the keys when all of the object's properties are declared in its type.

#### `keysIncludingSymbolsUnsound`

Like [keysIncludingSymbols](#keysIncludingSymbols), but use the object type to infer the type
of the keys.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
key will not appear in the return type, but the key will still be returned at
runtime.

If a property is not enumerable, its key will not be returned at runtime,
even if its key appears in the return type.

#### `values`

Alias for
[Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
with a sound type signature.

See [valuesUnsound](#valuesUnsound) to infer a more specific type for the values when
all of the object's properties are declared in its type.
See [this issue](https://github.com/microsoft/TypeScript/issues/38520)
explaining why
[Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
is unsound.

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

#### `valuesIncludingSymbols`

Return the values of an object's own enumerable properties.

This differs from
[Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)
by including properties with symbol keys.

#### `valuesIncludingSymbolsUnsound`

Like [valuesIncludingSymbols](#valuesIncludingSymbols), but use the object type to infer the
type of the values.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
value will not appear in the return type, but the value will still be
returned at runtime.

If a property is not enumerable, its value will not be returned at runtime,
even if its value appears in the return type.

#### `mapValues`

Return a new object created by mapping the enumerable own property values of
an existing object. This is analogous to
[Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

See [mapValuesUnsound](#mapValuesUnsound) to infer more specific types for the keys and
values when all of the object's properties are declared in its type.

#### `mapValuesUnsound`

Like [mapValues](#mapValues), but use the object type to infer the types of the
values and keys.

This is unsound unless all of the object's own enumerable properties are
declared in its type. If a property is not declared in the object type, its
key and value cannot be type-checked against the function parameter types,
but the function will still be called with that key and value at runtime.

#### `merge`

Return a new object created by merging the enumerable own properties of the
provided objects, skipping properties that are explicitly set to `undefined`.

```ts
merge({ a: 1, b: 2, c: 3 }, { a: 99, b: undefined }); // { a: 99, b: 2, c: 3 }
```

By default, TypeScript allows optional properties to be explicitly set to
`undefined`. When merging partial objects, it's often desirable to skip
properties that are set to `undefined` in order to use a default value:

```ts
const defaults = { muted: false, volume: 20 };
const muted = merge(defaults, { muted: true, volume: undefined }); // { muted: true, volume: 20 }
```

[Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
and
[object spreading](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals)
do not give the desired result:

```ts
const wrong1 = { ...defaults, ...{ muted: true, volume: undefined } }; // { muted: true, volume: undefined }
```

If the TypeScript flag
[exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes)
is not enabled, then `undefined` can be assigned to any optional property,
and object spreading is unsound:

```ts
type Config = { muted: boolean; volume: number };
const overrides: Partial<Config> = { muted: true, volume: undefined };
const wrong2: Config = { ...defaults, ...overrides };
// No type errors, but at runtime, volume is undefined instead of a number
const volume: number = wrong2.volume;
```

#### `omit`

Return a new object created by copying the enumerable own properties of a
source object, but omitting the properties with the specified keys.

See [omitLoose](#omitLoose) to allow keys that are not `keyof T`.

#### `omitLoose`

Return a new object created by copying the enumerable own properties of a
source object, but omitting the properties with the specified keys.

The type of the returned object will be inaccurate if any of the keys are not
literal strings or unique symbols. For example, providing a key with type
`string` will omit all string-keyed properties from the type of the returned
object. This type inference limitation does not affect the runtime behavior.

See [omit](#omit) to restrict the keys to `keyof T`.

#### `pick`

Return a new object created by copying the properties of a source object with
the specified keys.

Non-enumerable properties are copied from the source object, but the
properties will be enumerable in the returned object.

### Primitives

#### `Primitive`

A JavaScript
[primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

```ts
type Primitive = bigint | boolean | number | string | symbol | null | undefined;
```

#### `isPrimitive`

Return whether a value is a [Primitive](#Primitive).

```ts
isPrimitive(5); // true
isPrimitive([]); // false
```

#### `stringifyPrimitive`

Return a string representation of a [Primitive](#Primitive) that resembles how it
would be written as a literal in source code.

```ts
console.log(stringifyPrimitive(BigInt(-27))); // -27n
console.log(stringifyPrimitive("hi\nbye")); // "hi\nbye"
// Symbols are unique, so they cannot be recreated
// by evaluating their string representation:
console.log(stringifyPrimitive(Symbol("apple"))); // Symbol(apple)
```
