import { CakeErrorStringifier } from "./index-internal";
import type { Cake, StringTree } from "./index-internal";

interface CakeErrorDispatchFormatContext {
  readonly recurse: (error: CakeError) => StringTree;
  readonly stringifyCake: (cake: Cake) => string;
}

/**
 * @public
 */
abstract class CakeError {
  abstract dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree;

  toString(): string {
    return new CakeErrorStringifier().stringify(this);
  }
}

export { CakeError, CakeErrorDispatchFormatContext };
