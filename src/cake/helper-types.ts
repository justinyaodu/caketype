import type { Bakeable, Baked, Cake, Infer } from "./index-internal";

/**
 * @internal
 */
type MapBaked<T extends readonly Bakeable[]> = T extends readonly []
  ? []
  : T extends readonly [
      infer F extends Bakeable,
      ...infer R extends readonly Bakeable[]
    ]
  ? [Baked<F>, ...MapBaked<R>]
  : Cake[];

/**
 * @internal
 */
type MapInfer<T extends readonly Cake[]> = T extends readonly []
  ? []
  : T extends readonly [
      infer F extends Cake,
      ...infer R extends readonly Cake[]
    ]
  ? [Infer<F>, ...MapInfer<R>]
  : unknown[];

export { MapBaked, MapInfer };
