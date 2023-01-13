import { CakeStringifier } from "./index-internal";
import type {
  CakeError,
  CakeErrorDispatchFormatContext,
} from "./index-internal";

type StringTree = string | [string, StringTree[]];

class CakeErrorStringifier {
  readonly cakeStringifier: CakeStringifier;
  protected readonly context: CakeErrorDispatchFormatContext;

  constructor() {
    this.cakeStringifier = new CakeStringifier();
    this.context = {
      recurse: (error) => this.formatVisit(error),
      stringifyCake: (cake) => this.cakeStringifier.stringify(cake),
    };
  }

  format(error: CakeError): StringTree {
    return this.formatVisit(error);
  }

  protected formatVisit(error: CakeError): StringTree {
    return this.formatDispatch(error);
  }

  protected formatDispatch(error: CakeError): StringTree {
    return error.dispatchFormat(this.context);
  }

  stringify(error: CakeError): string {
    const flattened: (string | 1 | -1)[] = [];
    CakeErrorStringifier.flatten(this.format(error), flattened);

    let indent = 0;
    const lines: string[] = [];
    for (const value of flattened) {
      if (typeof value === "number") {
        indent += value;
      } else {
        lines.push("  ".repeat(indent) + value);
      }
    }
    return lines.join("\n");
  }

  private static flatten(tree: StringTree, arr: (string | 1 | -1)[]): void {
    if (typeof tree === "string") {
      arr.push(tree);
      return;
    }

    arr.push(tree[0]);
    arr.push(1);
    for (const child of tree[1]) {
      CakeErrorStringifier.flatten(child, arr);
    }
    arr.push(-1);
  }
}

export { CakeErrorStringifier, StringTree };
