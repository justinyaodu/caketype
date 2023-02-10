import {
  CakeError,
  CakeErrorDispatchFormatContext,
  Refinement,
  StringTree,
} from "./index-internal";

/**
 * @public
 */
interface NumberConstraints {
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly stepFrom?: number;
}

/**
 * @public
 */
interface NumberConstraintsRefinementArgs {
  constraints: NumberConstraints;
}

/**
 * @public
 */
class NumberConstraintsRefinement
  extends Refinement<number>
  implements NumberConstraintsRefinementArgs
{
  readonly constraints: NumberConstraints;

  constructor(args: NumberConstraintsRefinementArgs) {
    super();
    this.constraints = args.constraints;
  }

  dispatchCheck(value: number): CakeError | null {
    if (this.constraints.min !== undefined && value < this.constraints.min) {
      return new NumberMinCakeError(value, this.constraints.min);
    }

    if (this.constraints.max !== undefined && value > this.constraints.max) {
      return new NumberMaxCakeError(value, this.constraints.max);
    }

    if (this.constraints.step !== undefined) {
      const step = this.constraints.step;
      const stepFrom = this.constraints.stepFrom ?? 0;
      // TODO: this check might fail due to floating-point imprecision.
      if ((value - stepFrom) % step !== 0) {
        return new NumberStepCakeError(value, step, stepFrom);
      }
    }

    return null;
  }

  toString(): string {
    const parts: string[] = [];
    if (this.constraints.min !== undefined) {
      parts.push(`min ${this.constraints.min}`);
    }
    if (this.constraints.max !== undefined) {
      parts.push(`max ${this.constraints.max}`);
    }
    if (this.constraints.step !== undefined) {
      const stepFrom = this.constraints.stepFrom;
      parts.push(
        `${stepFrom === undefined ? "" : `${stepFrom} plus a `}multiple of ${
          this.constraints.step
        }`
      );
    }
    return parts.join(", ");
  }
}

class NumberMinCakeError extends CakeError {
  constructor(readonly value: number, readonly min: number) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    return `Number is less than the minimum of ${this.min}.`;
  }
}

class NumberMaxCakeError extends CakeError {
  constructor(readonly value: number, readonly max: number) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    return `Number is greater than the maximum of ${this.max}.`;
  }
}

class NumberStepCakeError extends CakeError {
  constructor(
    readonly value: number,
    readonly step: number,
    readonly stepFrom: number
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    return `Number is not${
      this.stepFrom === 0 ? "" : ` ${this.stepFrom} plus`
    } a multiple of ${this.step}.`;
  }
}

export {
  NumberConstraints,
  NumberConstraintsRefinement,
  NumberConstraintsRefinementArgs,
};
