import {
  bake,
  Cake,
  CakeError,
  CakeErrorDispatchFormatContext,
  NumberConstraints,
  NumberConstraintsRefinement,
  prependStringTree,
  Refinement,
  StringTree,
} from "./index-internal";

interface StringConstraints {
  length?: number | NumberConstraints | Cake;
  regex?: RegExp;
}

interface StringConstraintsRefinementArgs {
  constraints: StringConstraints;
}

class StringConstraintsRefinement
  extends Refinement<string>
  implements StringConstraintsRefinementArgs
{
  readonly constraints: StringConstraints;
  private readonly lengthSpec: NumberConstraintsRefinement | Cake | null;

  constructor(args: StringConstraintsRefinementArgs) {
    super();
    this.constraints = args.constraints;

    const rawLengthSpec = args.constraints.length;
    if (rawLengthSpec === undefined) {
      this.lengthSpec = null;
    } else if (typeof rawLengthSpec === "number") {
      this.lengthSpec = bake(rawLengthSpec);
    } else if (rawLengthSpec instanceof Cake) {
      this.lengthSpec = rawLengthSpec;
    } else {
      this.lengthSpec = new NumberConstraintsRefinement({
        constraints: rawLengthSpec,
      });
    }
  }

  dispatchCheck(value: string): CakeError | null {
    if (this.lengthSpec !== null) {
      const result = this.lengthSpec.check(value.length);
      if (!result.ok) {
        return new StringLengthCakeError(value, result.error);
      }
    }

    const regex = this.constraints.regex;
    if (regex !== undefined && !regex.test(value)) {
      return new RegexNotMatchedCakeError(value, regex);
    }

    return null;
  }

  toString(): string {
    const parts: string[] = [];
    if (this.lengthSpec !== null) {
      parts.push(`length ${this.lengthSpec}`);
    }
    if (this.constraints.regex !== undefined) {
      parts.push(`regex ${this.constraints.regex}`);
    }
    return parts.join(", ");
  }
}

class StringLengthCakeError extends CakeError {
  constructor(readonly value: string, readonly error: CakeError) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { recurse } = context;
    return prependStringTree("String length is invalid: ", recurse(this.error));
  }
}

class RegexNotMatchedCakeError extends CakeError {
  constructor(readonly value: string, readonly regex: RegExp) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    return `String does not match regex ${this.regex}.`;
  }
}

export {
  StringConstraints,
  StringConstraintsRefinement,
  StringConstraintsRefinementArgs,
};
