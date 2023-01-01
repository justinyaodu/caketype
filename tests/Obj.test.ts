import { Assert, AssertExtends, Equivalent, If, Merged, Obj } from "../src";
import { FlagExactOptionalPropertyTypes } from "../src/index-internal";

import { typeCheckOnly } from "./test-helpers";

describe("documentation examples", () => {
  test("merge simple", () => {
    expect(
      Obj.merge({ a: 1, b: 2, c: 3 }, { a: 99, b: undefined })
    ).toStrictEqual({ a: 99, b: 2, c: 3 });
  });

  test("merge vs. spread", () => {
    const defaults = { muted: false, volume: 20 };
    const muted = Obj.merge(defaults, { muted: true, volume: undefined });
    expect(muted).toStrictEqual({ muted: true, volume: 20 });

    const wrong1 = { ...defaults, ...{ muted: true, volume: undefined } };
    expect(wrong1).toStrictEqual({ muted: true, volume: undefined });

    type Config = { muted: boolean; volume: number };

    const overrides: If<
      FlagExactOptionalPropertyTypes,
      { muted?: boolean; volume?: number | undefined },
      Partial<Config>
    > = { muted: true, volume: undefined };

    const wrong2: If<
      FlagExactOptionalPropertyTypes,
      { muted: boolean; volume: number | undefined },
      Config
    > = { ...defaults, ...overrides };

    // No type errors, but at runtime, volume is undefined instead of a number
    const volume: If<
      FlagExactOptionalPropertyTypes,
      number | undefined,
      number
    > = wrong2.volume;

    expect(volume).toStrictEqual(undefined);
  });
});

const {
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
} = Obj;

const inheritedSymbol = Symbol("inheritedSymbol");
const nonEnumInheritedSymbol = Symbol("nonEnumInheritedSymbol");
const ownSymbol = Symbol("ownSymbol");
const nonEnumOwnSymbol = Symbol("nonEnumOwnSymbol");

const primesPrototype = Object.create(Object, {
  inheritedString: { value: 2, enumerable: true },
  [inheritedSymbol]: { value: 3, enumerable: true },
  nonEnumInheritedString: { value: 5, enumerable: false },
  [nonEnumInheritedSymbol]: { value: 7, enumerable: false },
});

const primes: {
  inheritedString: 2;
  [inheritedSymbol]: 3;
  nonEnumInheritedString: 5;
  [nonEnumInheritedSymbol]: 7;
  ownString: 11;
  [ownSymbol]: 13;
  nonEnumOwnString: 17;
  [nonEnumOwnSymbol]: 19;
} = Object.create(primesPrototype, {
  ownString: { value: 11, enumerable: true },
  [ownSymbol]: { value: 13, enumerable: true },
  nonEnumOwnString: { value: 17, enumerable: false },
  [nonEnumOwnSymbol]: { value: 19, enumerable: false },
});

const objects = {
  empty: {},
  primes,
  food: {
    one: "apple",
    [Symbol.hasInstance]: "ham",
    two: "banana",
    [Symbol.match]: "mochi",
    three: "cherry",
  },
} as const;

type MappedObjects<T = unknown> = { [K in keyof typeof objects]: T };

describe("check inferred return types", () => {
  test(
    "entriesUnsound",
    typeCheckOnly(() => {
      const allEntries = {
        empty: entriesUnsound(objects.empty),
        primes: entriesUnsound(objects.primes),
        food: entriesUnsound(objects.food),
      };

      type _ = [
        AssertExtends<typeof allEntries, MappedObjects>,
        Assert<
          Equivalent<
            typeof allEntries,
            {
              empty: never[];
              primes: (
                | ["inheritedString", 2]
                | ["nonEnumInheritedString", 5]
                | ["ownString", 11]
                | ["nonEnumOwnString", 17]
              )[];
              food: (
                | ["one", "apple"]
                | ["two", "banana"]
                | ["three", "cherry"]
              )[];
            }
          >
        >
      ];
    })
  );

  test(
    "entriesIncludingSymbolsUnsound",
    typeCheckOnly(() => {
      const allEntries = {
        empty: entriesIncludingSymbolsUnsound(objects.empty),
        primes: entriesIncludingSymbolsUnsound(objects.primes),
        food: entriesIncludingSymbolsUnsound(objects.food),
      };

      type _ = [
        AssertExtends<typeof allEntries, MappedObjects>,
        Assert<
          Equivalent<
            typeof allEntries,
            {
              empty: never[];
              primes: (
                | ["inheritedString", 2]
                | ["nonEnumInheritedString", 5]
                | ["ownString", 11]
                | ["nonEnumOwnString", 17]
                | [typeof inheritedSymbol, 3]
                | [typeof nonEnumInheritedSymbol, 7]
                | [typeof ownSymbol, 13]
                | [typeof nonEnumOwnSymbol, 19]
              )[];
              food: (
                | ["one", "apple"]
                | ["two", "banana"]
                | ["three", "cherry"]
                | [typeof Symbol.hasInstance, "ham"]
                | [typeof Symbol.match, "mochi"]
              )[];
            }
          >
        >
      ];
    })
  );

  test(
    "keysUnsound",
    typeCheckOnly(() => {
      const allKeys = {
        empty: keysUnsound(objects.empty),
        primes: keysUnsound(objects.primes),
        food: keysUnsound(objects.food),
      };

      type _ = [
        AssertExtends<typeof allKeys, MappedObjects>,
        Assert<
          Equivalent<
            typeof allKeys,
            {
              empty: never[];
              primes: (
                | "inheritedString"
                | "nonEnumInheritedString"
                | "ownString"
                | "nonEnumOwnString"
              )[];
              food: ("one" | "two" | "three")[];
            }
          >
        >
      ];
    })
  );

  test(
    "keysIncludingSymbolsUnsound",
    typeCheckOnly(() => {
      () => {
        const allKeys = {
          empty: keysIncludingSymbolsUnsound(objects.empty),
          primes: keysIncludingSymbolsUnsound(objects.primes),
          food: keysIncludingSymbolsUnsound(objects.food),
        };

        type _ = [
          AssertExtends<typeof allKeys, MappedObjects>,
          Assert<
            Equivalent<
              typeof allKeys,
              {
                empty: never[];
                primes: (
                  | "inheritedString"
                  | "nonEnumInheritedString"
                  | "ownString"
                  | "nonEnumOwnString"
                  | typeof inheritedSymbol
                  | typeof nonEnumInheritedSymbol
                  | typeof ownSymbol
                  | typeof nonEnumOwnSymbol
                )[];
                food: (
                  | "one"
                  | "two"
                  | "three"
                  | typeof Symbol.hasInstance
                  | typeof Symbol.match
                )[];
              }
            >
          >
        ];
      };
    })
  );

  test(
    "valuesUnsound",
    typeCheckOnly(() => {
      const allEntries = {
        empty: valuesUnsound(objects.empty),
        primes: valuesUnsound(objects.primes),
        food: valuesUnsound(objects.food),
      };

      type _ = [
        AssertExtends<typeof allEntries, MappedObjects>,
        Assert<
          Equivalent<
            typeof allEntries,
            {
              empty: never[];
              primes: (2 | 5 | 11 | 17)[];
              food: ("apple" | "banana" | "cherry")[];
            }
          >
        >
      ];
    })
  );

  test(
    "valuesIncludingSymbolsUnsound",
    typeCheckOnly(() => {
      const allEntries = {
        empty: valuesIncludingSymbolsUnsound(objects.empty),
        primes: valuesIncludingSymbolsUnsound(objects.primes),
        food: valuesIncludingSymbolsUnsound(objects.food),
      };

      type _ = [
        AssertExtends<typeof allEntries, MappedObjects>,
        Assert<
          Equivalent<
            typeof allEntries,
            {
              empty: never[];
              primes: (2 | 5 | 11 | 17 | 3 | 7 | 13 | 19)[];
              food: ("apple" | "banana" | "cherry" | "ham" | "mochi")[];
            }
          >
        >
      ];
    })
  );

  test(
    "merge two objects with every possible combination of properties",
    typeCheckOnly(() => {
      // Property naming convention:
      // r = required, o = optional
      // u = undefined, su = string | undefined, s = string
      // f = only on First, s = only on Second
      // xxx_yyy = xxx on First, yyy on Second

      interface First {
        fru: undefined;
        frsu: "first" | undefined;
        frs: "first";
        fou?: undefined;
        fosu?: "first" | undefined;
        fos?: "first";

        ru_ru: undefined;
        rsu_ru: "first" | undefined;
        rs_ru: "first";
        ou_ru?: undefined;
        osu_ru?: "first" | undefined;
        os_ru?: "first";

        ru_rsu: undefined;
        rsu_rsu: "first" | undefined;
        rs_rsu: "first";
        ou_rsu?: undefined;
        osu_rsu?: "first" | undefined;
        os_rsu?: "first";

        ru_rs: undefined;
        rsu_rs: "first" | undefined;
        rs_rs: "first";
        ou_rs?: undefined;
        osu_rs?: "first" | undefined;
        os_rs?: "first";

        ru_ou: undefined;
        rsu_ou: "first" | undefined;
        rs_ou: "first";
        ou_ou?: undefined;
        osu_ou?: "first" | undefined;
        os_ou?: "first";

        ru_osu: undefined;
        rsu_osu: "first" | undefined;
        rs_osu: "first";
        ou_osu?: undefined;
        osu_osu?: "first" | undefined;
        os_osu?: "first";

        ru_os: undefined;
        rsu_os: "first" | undefined;
        rs_os: "first";
        ou_os?: undefined;
        osu_os?: "first" | undefined;
        os_os?: "first";
      }

      interface Second {
        sru: undefined;
        srsu: "first" | undefined;
        srs: "first";
        sou?: undefined;
        sosu?: "first" | undefined;
        sos?: "first";

        ru_ru: undefined;
        rsu_ru: undefined;
        rs_ru: undefined;
        ou_ru: undefined;
        osu_ru: undefined;
        os_ru: undefined;

        ru_rsu: "second" | undefined;
        rsu_rsu: "second" | undefined;
        rs_rsu: "second" | undefined;
        ou_rsu: "second" | undefined;
        osu_rsu: "second" | undefined;
        os_rsu: "second" | undefined;

        ru_rs: "second";
        rsu_rs: "second";
        rs_rs: "second";
        ou_rs: "second";
        osu_rs: "second";
        os_rs: "second";

        ru_ou?: undefined;
        rsu_ou?: undefined;
        rs_ou?: undefined;
        ou_ou?: undefined;
        osu_ou?: undefined;
        os_ou?: undefined;

        ru_osu?: "second" | undefined;
        rsu_osu?: "second" | undefined;
        rs_osu?: "second" | undefined;
        ou_osu?: "second" | undefined;
        osu_osu?: "second" | undefined;
        os_osu?: "second" | undefined;

        ru_os?: "second";
        rsu_os?: "second";
        rs_os?: "second";
        ou_os?: "second";
        osu_os?: "second";
        os_os?: "second";
      }

      interface ExpectedMerged {
        // fru: never,
        frsu?: "first";
        frs: "first";
        // fou?: never,
        fosu?: "first";
        fos?: "first";

        // sru: never,
        srsu?: "first";
        srs: "first";
        // sou?: never,
        sosu?: "first";
        sos?: "first";

        // ru_ru: never,
        rsu_ru?: "first";
        rs_ru: "first";
        // ou_ru: never,
        osu_ru?: "first";
        os_ru?: "first";

        ru_rsu?: "second";
        rsu_rsu?: "second" | "first";
        rs_rsu: "second" | "first";
        ou_rsu?: "second";
        osu_rsu?: "second" | "first";
        os_rsu?: "second" | "first";

        ru_rs: "second";
        rsu_rs: "second";
        rs_rs: "second";
        ou_rs: "second";
        osu_rs: "second";
        os_rs: "second";

        // ru_ou?: never,
        rsu_ou?: "first";
        rs_ou: "first";
        // ou_ou?: never,
        osu_ou?: "first";
        os_ou?: "first";

        ru_osu?: "second";
        rsu_osu?: "second" | "first";
        rs_osu: "second" | "first";
        ou_osu?: "second";
        osu_osu?: "second" | "first";
        os_osu?: "second" | "first";

        ru_os?: "second";
        rsu_os?: "second" | "first";
        rs_os: "second" | "first";
        ou_os?: "second";
        osu_os?: "second" | "first";
        os_os?: "second" | "first";
      }

      type _ = Assert<Equivalent<Merged<[First, Second]>, ExpectedMerged>>;
    })
  );

  test("merge one object", () => {
    interface First {
      ru: undefined;
      rsu: "first" | undefined;
      rs: "first";
      ou?: undefined;
      osu?: "first" | undefined;
      os?: "first";
    }

    interface ExpectedMerged {
      // ru: never;
      rsu?: "first";
      rs: "first";
      // ou?: never;
      osu?: "first";
      os?: "first";
    }

    type _ = Assert<Equivalent<Merged<[First]>, ExpectedMerged>>;
  });

  test("merge three objects", () => {
    interface First {
      me: "first";
      maybeMe?: "first";
      first: "first";
      different: "first";
    }

    interface Second {
      me: "second";
      maybeMe?: "second";
      second: "second";
      different?: "second";
    }

    interface Third {
      me: "third";
      maybeMe?: "third";
      third: "third";
    }

    interface Common {
      maybeMe?: "first" | "second" | "third";
      first: "first";
      second: "second";
      third: "third";
    }

    interface FST extends Common {
      me: "third";
      different: "first" | "second";
    }

    interface FTS extends Common {
      me: "second";
      different: "first" | "second";
    }

    interface SFT extends Common {
      me: "third";
      different: "first";
    }

    interface STF extends Common {
      me: "first";
      different: "first";
    }

    interface TFS extends Common {
      me: "second";
      different: "first" | "second";
    }

    interface TSF extends Common {
      me: "first";
      different: "first";
    }

    type _ = [
      Assert<Equivalent<Merged<[First, Second, Third]>, FST>>,
      Assert<Equivalent<Merged<[First, Third, Second]>, FTS>>,
      Assert<Equivalent<Merged<[Second, First, Third]>, SFT>>,
      Assert<Equivalent<Merged<[Second, Third, First]>, STF>>,
      Assert<Equivalent<Merged<[Third, First, Second]>, TFS>>,
      Assert<Equivalent<Merged<[Third, Second, First]>, TSF>>
    ];
  });
});

describe("entries, keys, values", () => {
  test.each(
    Object.entries(objects).map(([k, o]) => [
      k as keyof typeof objects,
      Object.entries(o),
    ])
  )("entries(%s) returns %p", (k, expected) => {
    expect(entries(objects[k])).toStrictEqual(expected);
    expect(entriesUnsound(objects[k])).toStrictEqual(expected);
  });

  // Now that we've tested entriesUnsound, we can use it to set up the remaining
  // tests.

  test.each(entriesUnsound(objects).map(([k, o]) => [k, Object.keys(o)]))(
    "keys(%s) returns %p",
    (k, expected) => {
      expect(keys(objects[k])).toStrictEqual(expected);
      expect(keysUnsound(objects[k])).toStrictEqual(expected);
    }
  );

  test.each(entriesUnsound(objects).map(([k, o]) => [k, Object.values(o)]))(
    "values(%s) returns %p",
    (k, expected) => {
      expect(values(objects[k])).toStrictEqual(expected);
      expect(valuesUnsound(objects[k])).toStrictEqual(expected);
    }
  );
});

describe("entriesIncludingSymbols, keysIncludingSymbols, valuesIncludingSymbols", () => {
  const expectedEntries: MappedObjects<[string | symbol, unknown][]> = {
    empty: [],
    primes: [
      ["ownString", 11],
      [ownSymbol, 13],
    ],
    food: [
      ["one", "apple"],
      ["two", "banana"],
      ["three", "cherry"],
      [Symbol.hasInstance, "ham"],
      [Symbol.match, "mochi"],
    ],
  };

  test.each(entriesUnsound(expectedEntries))(
    "entriesIncludingSymbols(%s) returns %p",
    (k, expected) => {
      expect(entriesIncludingSymbols(objects[k])).toStrictEqual(expected);
      expect(entriesIncludingSymbolsUnsound(objects[k])).toStrictEqual(
        expected
      );
    }
  );

  test.each(
    entriesUnsound(expectedEntries).map(([k, entries]) => [
      k,
      entries.map((entry) => entry[0]),
    ])
  )("keysIncludingSymbols(%s) returns %p", (k, expected) => {
    expect(keysIncludingSymbols(objects[k])).toStrictEqual(expected);
    expect(keysIncludingSymbolsUnsound(objects[k])).toStrictEqual(expected);
  });

  test.each(
    entriesUnsound(expectedEntries).map(([k, entries]) => [
      k,
      entries.map((entry) => entry[1]),
    ])
  )("valuesIncludingSymbols(%s) returns %p", (k, expected) => {
    expect(valuesIncludingSymbols(objects[k])).toStrictEqual(expected);
    expect(valuesIncludingSymbolsUnsound(objects[k])).toStrictEqual(expected);
  });
});

test("mapValues, mapValuesUnsound", () => {
  const mapped = mapValues(objects.food, (v, k, o) => [v, k, o] as const);
  const mappedUnsound = mapValuesUnsound(
    objects.food,
    (v, k, o) => [v, k, o] as const
  );

  type MappedSound = readonly [unknown, string | symbol, typeof objects.food];
  type MappedUnsound = readonly [
    "apple" | "banana" | "cherry" | "ham" | "mochi",
    "one" | "two" | "three" | typeof Symbol.hasInstance | typeof Symbol.match,
    typeof objects.food
  ];

  type _ = [
    Assert<
      Equivalent<
        typeof mapped,
        {
          one: MappedSound;
          two: MappedSound;
          three: MappedSound;
          [Symbol.hasInstance]: MappedSound;
          [Symbol.match]: MappedSound;
        }
      >
    >,
    Assert<
      Equivalent<
        typeof mappedUnsound,
        {
          one: MappedUnsound;
          two: MappedUnsound;
          three: MappedUnsound;
          [Symbol.hasInstance]: MappedUnsound;
          [Symbol.match]: MappedUnsound;
        }
      >
    >
  ];

  const expected = {
    one: ["apple", "one", objects.food],
    two: ["banana", "two", objects.food],
    three: ["cherry", "three", objects.food],
    [Symbol.hasInstance]: ["ham", Symbol.hasInstance, objects.food],
    [Symbol.match]: ["mochi", Symbol.match, objects.food],
  };

  expect(mapped).toStrictEqual(expected);
  expect(mappedUnsound).toStrictEqual(expected);
});

describe("merge", () => {
  test("one object", () => {
    expect(merge({ s: "first", u: undefined })).toStrictEqual({ s: "first" });
  });

  test("two objects", () => {
    expect(
      merge(
        {
          s_s: "first",
          s_u: "first",
          s_m: "first",
          u_s: undefined,
          u_u: undefined,
          u_m: undefined,
          // m_s,
          // m_u,
          // m_m,
        },
        {
          s_s: "second",
          s_u: undefined,
          // s_m,
          u_s: "second",
          u_u: undefined,
          // u_m,
          m_s: "second",
          m_u: undefined,
          // m_m,
        }
      )
    ).toStrictEqual({
      s_s: "second",
      s_u: "first",
      s_m: "first",
      u_s: "second",
      // u_u,
      // u_m,
      m_s: "second",
      // m_u,
      // m_m,
    });
  });
});

describe("omit", () => {
  test("two keys", () => {
    for (const func of [omit, omitLoose]) {
      const omitted = func(objects.food, "two", Symbol.hasInstance);

      type _ = Assert<
        Equivalent<
          typeof omitted,
          Omit<Readonly<typeof objects.food>, "two" | typeof Symbol.hasInstance>
        >
      >;

      // Check entries to ensure that the order of keys is preserved.
      expect(entriesIncludingSymbols(omitted)).toStrictEqual([
        ["one", "apple"],
        ["three", "cherry"],
        [Symbol.match, "mochi"],
      ]);
    }
  });

  test("only enumerable own properties copied", () => {
    for (const func of [omit, omitLoose]) {
      const omitted = func(objects.primes, ownSymbol);

      type _ = Assert<
        Equivalent<
          typeof omitted,
          Omit<Readonly<typeof objects.primes>, typeof ownSymbol>
        >
      >;

      expect(omitted).toStrictEqual({ ownString: 11 });
    }
  });

  test("key not in object", () => {
    const omittedLoose = omitLoose(objects.food, "nonexistent");

    type _ = Assert<Equivalent<typeof omittedLoose, typeof objects.food>>;

    // @ts-expect-error
    const omitted = omit(objects.food, "nonexistent");

    expect(omitted).toStrictEqual(objects.food);
    expect(omittedLoose).toStrictEqual(objects.food);
  });
});

describe("pick", () => {
  test("non-enumerable and inherited properties", () => {
    const picked = pick(
      objects.primes,
      inheritedSymbol,
      "nonEnumInheritedString",
      "ownString",
      nonEnumOwnSymbol
    );

    type _ = Assert<
      Equivalent<
        typeof picked,
        {
          nonEnumInheritedString: 5;
          ownString: 11;
          [inheritedSymbol]: 3;
          [nonEnumOwnSymbol]: 19;
        }
      >
    >;

    expect(entriesIncludingSymbols(picked)).toStrictEqual([
      ["nonEnumInheritedString", 5],
      ["ownString", 11],
      [inheritedSymbol, 3],
      [nonEnumOwnSymbol, 19],
    ]);
  });

  test("key not in object", () => {
    // @ts-expect-error
    const picked = pick(objects.food, "whoa");

    expect(picked).toStrictEqual({
      whoa: undefined,
    });
  });
});
