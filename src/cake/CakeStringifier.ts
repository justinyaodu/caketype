import { deepGetResult } from "../index-internal";

import type { Cake, CakeDispatchStringifyContext } from "./index-internal";

class CakeStringifier {
  protected readonly cache: Map<Cake, string | undefined>;
  protected readonly context: CakeDispatchStringifyContext;

  constructor() {
    this.cache = new Map();
    this.context = {
      recurse: (cake) => this.stringifyVisit(cake),
    };
  }

  stringify(cake: Cake): string {
    return this.stringifyVisit(cake);
  }

  protected stringifyVisit(cake: Cake): string {
    const result = deepGetResult(this.cache, cake);
    if (result.ok) {
      if (result.value === undefined) {
        return "[Circular]";
      } else {
        return result.value;
      }
    } else {
      this.cache.set(cake, undefined);
      const stringified = this.stringifyDispatch(cake);
      this.cache.set(cake, stringified);
      return stringified;
    }
  }

  protected stringifyDispatch(cake: Cake): string {
    return cake.dispatchStringify(this.context);
  }
}

export { CakeStringifier };
