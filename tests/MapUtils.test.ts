/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  deleteResult,
  getOrSet,
  getOrSetComputed,
  getResult,
  deepDeleteResult,
  deepDelete,
  deepGetResult,
  deepGet,
  deepHas,
  deepSet,
  MapLike,
  MapUtils,
  Result,
  AssertExtends,
} from "../src";

import { typeCheckOnly } from "./test-helpers";

describe("documentation examples", () => {
  function threeHi(): Map<number, string> {
    const map: Map<number, string> = new Map();
    map.set(3, "hi");
    return map;
  }

  function threeHiSeven(): Map<number, Map<string, number>> {
    const map: Map<number, Map<string, number>> = new Map();
    map.set(3, new Map());
    map.get(3)!.set("hi", 7);
    return map;
  }

  test("MapUtils", () => {
    const nestedMap: Map<number, Map<string, number>> = new Map();

    deepSet(nestedMap, 3, "hi", 7);
    expect(nestedMap).toStrictEqual(new Map([[3, new Map([["hi", 7]])]]));

    MapUtils.deepSet(nestedMap, 3, "hi", 7);
    expect(nestedMap).toStrictEqual(new Map([[3, new Map([["hi", 7]])]]));
  });

  test("deleteResult", () => {
    const map = threeHi();

    expect(deleteResult(map, 3)).toStrictEqual(Result.ok("hi"));
    expect(map.size).toStrictEqual(0);

    expect(deleteResult(map, 3)).toStrictEqual(Result.err());
  });

  test("getResult", () => {
    const map = threeHi();

    expect(getResult(map, 3)).toStrictEqual(Result.ok("hi"));
    expect(getResult(map, 4)).toStrictEqual(Result.err());
  });

  test("getOrSet", () => {
    const map = threeHi();

    expect(getOrSet(map, 3, "default")).toStrictEqual("hi");
    expect(map).toStrictEqual(threeHi());

    expect(getOrSet(map, 4, "default")).toStrictEqual("default");
    expect(map).toStrictEqual(
      new Map([
        [3, "hi"],
        [4, "default"],
      ])
    );
  });

  test("getOrSetComputed", () => {
    const map: Map<string, string[]> = new Map();

    getOrSetComputed(map, "alice", () => []).push("bob");
    expect(map).toStrictEqual(new Map([["alice", ["bob"]]]));

    getOrSetComputed(map, "alice", () => []).push("cindy");
    expect(map).toStrictEqual(new Map([["alice", ["bob", "cindy"]]]));
  });

  test("getOrSetComputed with callback that uses the key", () => {
    const map: Map<string, string[]> = new Map();

    getOrSetComputed(map, "alice", (name) => [name]).push("bob");
    expect(map).toStrictEqual(new Map([["alice", ["alice", "bob"]]]));
  });

  test("deepDelete", () => {
    const map = threeHiSeven();

    expect(deepDelete(map, 3, "hi")).toStrictEqual(true);
    expect(map).toStrictEqual(new Map([[3, new Map()]]));

    expect(deepDelete(map, 3, "hi")).toStrictEqual(false);
    expect(map).toStrictEqual(new Map([[3, new Map()]]));
  });

  test("deepDeleteResult", () => {
    const map = threeHiSeven();

    expect(deepDeleteResult(map, 3, "hi")).toStrictEqual(Result.ok(7));
    expect(map).toStrictEqual(new Map([[3, new Map()]]));

    expect(deepDeleteResult(map, 3, "hi")).toStrictEqual(Result.err());
    expect(map).toStrictEqual(new Map([[3, new Map()]]));
  });

  test("deepGet", () => {
    const map = threeHiSeven();

    expect(deepGet(map, 3, "hi")).toStrictEqual(7);
    expect(deepGet(map, 3, "oops")).toStrictEqual(undefined);
    expect(deepGet(map, 4, "hi")).toStrictEqual(undefined);
  });

  test("deepGetResult", () => {
    const map = threeHiSeven();

    expect(deepGetResult(map, 3, "hi")).toStrictEqual(Result.ok(7));
    expect(deepGetResult(map, 3, "oops")).toStrictEqual(Result.err());
    expect(deepGetResult(map, 4, "hi")).toStrictEqual(Result.err());
  });

  test("deepHas", () => {
    const map = threeHiSeven();

    expect(deepHas(map, 3, "hi")).toStrictEqual(true);
    expect(deepHas(map, 3, "oops")).toStrictEqual(false);
    expect(deepHas(map, 4, "hi")).toStrictEqual(false);
  });

  test("deepSet", () => {
    const map: Map<number, Map<string, number>> = new Map();
    deepSet(map, 3, "hi", 7);
    expect(map).toStrictEqual(new Map([[3, new Map([["hi", 7]])]]));

    deepSet(map, 4, new Map());
    expect(map).toStrictEqual(
      new Map([
        [3, new Map([["hi", 7]])],
        [4, new Map()],
      ])
    );
  });

  test("deepSet alternative for WeakMaps", () => {
    const map: WeakMap<object, WeakMap<object, number>> = new WeakMap();
    const firstKey = {};
    const secondKey = {};
    const value = 5;
    getOrSetComputed(map, firstKey, () => new WeakMap()).set(secondKey, value);
    expect(map.get(firstKey)?.get(secondKey)).toStrictEqual(value);
  });
});

test(
  "MapLike type",
  typeCheckOnly(() => {
    type _ = [
      AssertExtends<WeakMap<object, boolean>, MapLike<object, boolean>>,
      AssertExtends<
        Map<string, Map<number, object>>,
        MapLike<string, MapLike<number, object>>
      >
    ];
  })
);

test("deleteResult", () => {
  const map: WeakMap<object, number> = new WeakMap([[Date, 4]]);

  expect(deleteResult(map, Date)).toStrictEqual(Result.ok(4));
  expect(map.has(Date)).toBe(false);

  expect(deleteResult(map, Date)).toStrictEqual(Result.err());
  expect(map.has(Date)).toBe(false);
});

test("getResult", () => {
  const map: WeakMap<object, number> = new WeakMap([[Date, 4]]);

  expect(getResult(map, Date)).toStrictEqual(Result.ok(4));
  expect(getResult(map, Array)).toStrictEqual(Result.err());
});

test("getOrSet", () => {
  const map: Map<number, boolean> = new Map();
  map.set(2, false);

  expect(getOrSet(map, 2, true)).toStrictEqual(false);
  expect(map).toStrictEqual(new Map([[2, false]]));

  expect(getOrSet(map, 5, true)).toStrictEqual(true);
  expect(map).toStrictEqual(
    new Map([
      [2, false],
      [5, true],
    ])
  );
});

test("getOrSetComputed", () => {
  const map: Map<number, boolean> = new Map();
  map.set(2, false);

  const isPositive = (key: number) => key > 0;

  expect(getOrSetComputed(map, 2, isPositive)).toBe(false);
  expect(map).toStrictEqual(new Map([[2, false]]));

  expect(getOrSetComputed(map, 5, isPositive)).toBe(true);
  expect(map).toStrictEqual(
    new Map([
      [2, false],
      [5, true],
    ])
  );
});

test("deepDeleteResult", () => {
  const map: Map<number, Map<string, boolean>> = new Map([
    [3, new Map([["hi", false]])],
  ]);

  expect(deepDeleteResult(map, 11)).toStrictEqual(Result.err());
  expect(map).toStrictEqual(new Map([[3, new Map([["hi", false]])]]));

  expect(deepDeleteResult(map, 3, "hi")).toStrictEqual(Result.ok(false));
  expect(map).toStrictEqual(new Map([[3, new Map()]]));

  expect(deepDeleteResult(map, 3, "hi")).toStrictEqual(Result.err());
  expect(map).toStrictEqual(new Map([[3, new Map()]]));

  expect(deepDeleteResult(map, 3)).toStrictEqual(Result.ok(new Map()));
  expect(map).toStrictEqual(new Map());

  typeCheckOnly(() => {
    // @ts-expect-error
    deepDeleteResult(map, "hi");

    // @ts-expect-error
    deepDeleteResult(map, 3, "hi", false);
  });
});

test("deepDelete", () => {
  const map: Map<number, Map<string, boolean>> = new Map([
    [3, new Map([["hi", false]])],
  ]);

  expect(deepDelete(map, 4)).toStrictEqual(false);
  expect(map).toStrictEqual(new Map([[3, new Map([["hi", false]])]]));

  expect(deepDelete(map, 4, "missing")).toStrictEqual(false);
  expect(map).toStrictEqual(new Map([[3, new Map([["hi", false]])]]));

  expect(deepDelete(map, 3, "hi")).toStrictEqual(true);
  expect(map).toStrictEqual(new Map([[3, new Map()]]));

  expect(deepDelete(map, 3, "hi")).toStrictEqual(false);
  expect(map).toStrictEqual(new Map([[3, new Map()]]));

  expect(deepDelete(map, 3)).toStrictEqual(true);
  expect(map).toStrictEqual(new Map());
});

test("deepGetResult", () => {
  const map: WeakMap<object, Map<number, Map<boolean, string>>> = new WeakMap([
    [Date, new Map([[7, new Map([[true, "nice"]])]])],
  ]);

  expect(deepGetResult(map, Array)).toStrictEqual(Result.err());
  expect(deepGetResult(map, Array, 25)).toStrictEqual(Result.err());
  expect<Result<Map<number, Map<boolean, string>>, undefined>>(
    deepGetResult(map, Date)
  ).toStrictEqual(Result.ok(new Map([[7, new Map([[true, "nice"]])]])));
  expect(deepGetResult(map, Date, 11)).toStrictEqual(Result.err());
  expect<Result<Map<boolean, string>, undefined>>(
    deepGetResult(map, Date, 7)
  ).toStrictEqual(Result.ok(new Map([[true, "nice"]])));
  expect(deepGetResult(map, Date, 7, false)).toStrictEqual(Result.err());
  expect<Result<string, undefined>>(
    deepGetResult(map, Date, 7, true)
  ).toStrictEqual(Result.ok("nice"));

  typeCheckOnly(() => {
    // @ts-expect-error
    deepGetResult(map, Date, "oops");

    // @ts-expect-error
    deepGetResult(map, Date, 7, true, "extra");
  });
});

test("deepGet", () => {
  const map: WeakMap<object, Map<number, Map<boolean, string>>> = new WeakMap([
    [Date, new Map([[7, new Map([[true, "nice"]])]])],
  ]);

  expect(deepGet(map, Array)).toStrictEqual(undefined);
  expect(deepGet(map, Array, 25)).toStrictEqual(undefined);
  expect(deepGet(map, Date)).toStrictEqual(
    new Map([[7, new Map([[true, "nice"]])]])
  );
  expect(deepGet(map, Date, 11)).toStrictEqual(undefined);
  expect(deepGet(map, Date, 7)).toStrictEqual(new Map([[true, "nice"]]));
  expect(deepGet(map, Date, 7, false)).toStrictEqual(undefined);
  expect(deepGet(map, Date, 7, true)).toStrictEqual("nice");
});

test("deepHas", () => {
  const map: WeakMap<object, Map<number, Map<boolean, string>>> = new WeakMap([
    [Date, new Map([[7, new Map([[true, "nice"]])]])],
  ]);

  expect(deepHas(map, Array)).toStrictEqual(false);
  expect(deepHas(map, Array, 25)).toStrictEqual(false);
  expect(deepHas(map, Date)).toStrictEqual(true);
  expect(deepHas(map, Date, 11)).toStrictEqual(false);
  expect(deepHas(map, Date, 7)).toStrictEqual(true);
  expect(deepHas(map, Date, 7, false)).toStrictEqual(false);
  expect(deepHas(map, Date, 7, true)).toStrictEqual(true);
});

describe("deepSet", () => {
  test("outer map is Map", () => {
    const map: Map<boolean, Map<number, Map<string, Date>>> = new Map();

    deepSet(map, false, new Map());
    expect(map).toStrictEqual(new Map([[false, new Map()]]));

    deepSet(map, true, 7, new Map());
    expect(map).toStrictEqual(
      new Map([
        [false, new Map()],
        [true, new Map([[7, new Map()]])],
      ])
    );

    deepSet(map, false, 7, "hi", new Date(0));
    expect(map).toStrictEqual(
      new Map([
        [false, new Map([[7, new Map([["hi", new Date(0)]])]])],
        [true, new Map([[7, new Map()]])],
      ])
    );

    deepSet(map, false, 7, "hi", new Date(9999));
    expect(map).toStrictEqual(
      new Map([
        [false, new Map([[7, new Map([["hi", new Date(9999)]])]])],
        [true, new Map([[7, new Map()]])],
      ])
    );

    deepSet(map, false, new Map());
    expect(map).toStrictEqual(
      new Map([
        [false, new Map()],
        [true, new Map([[7, new Map()]])],
      ])
    );

    typeCheckOnly(() => {
      // @ts-expect-error
      deepSet(map, "accident");

      // @ts-expect-error
      deepSet(map, false, 7);

      // @ts-expect-error
      deepSet(map, false, 7, "hello", new Date(0), "extra");
    });
  });

  test("outer map is WeakMap", () => {
    const map: WeakMap<object, Map<number, string>> = new WeakMap();
    deepSet(map, Date, 7, "hi");
    expect(map.get(Date)).toStrictEqual(new Map([[7, "hi"]]));
  });
});
