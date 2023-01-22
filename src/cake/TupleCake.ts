import { entriesUnsound } from "../index-internal";

import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  CakeErrorDispatchFormatContext,
  CakeArgs,
  Infer,
  optional,
  OptionalTag,
  prependStringTree,
  rest,
  RestTag,
  StringTree,
} from "./index-internal";

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

/**
 * @internal
 */
type MapInferOptional<T extends readonly Cake[]> = T extends readonly []
  ? []
  : T extends readonly [
      infer F extends Cake,
      ...infer R extends readonly Cake[]
    ]
  ? [Infer<F>?, ...MapInferOptional<R>]
  : unknown[];

/**
 * @internal
 */
type MapOptionalTag<T extends readonly Cake[]> = T extends readonly []
  ? []
  : T extends readonly [
      infer F extends Cake,
      ...infer R extends readonly Cake[]
    ]
  ? [OptionalTag<F>, ...MapOptionalTag<R>]
  : unknown[];

/**
 * @public
 */
interface TupleCakeArgs<
  S extends readonly Cake[],
  O extends readonly Cake[],
  R extends Cake | null,
  E extends readonly Cake[]
> extends CakeArgs {
  readonly startElements: S;
  readonly optionalElements: O;
  readonly restElement: R;
  readonly endElements: E;
}

/**
 * @public
 */
class TupleCake<
    S extends readonly Cake[],
    O extends readonly Cake[],
    R extends Cake | null,
    E extends readonly Cake[]
  >
  extends Cake<
    [
      ...MapInfer<S>,
      ...MapInferOptional<O>,
      ...(R extends Cake ? [...Infer<R>[]] : []),
      ...MapInfer<E>
    ]
  >
  implements TupleCakeArgs<S, O, R, E>
{
  readonly startElements: S;
  readonly optionalElements: O;
  readonly restElement: R;
  readonly endElements: E;

  constructor(args: TupleCakeArgs<S, O, R, E>) {
    super(args);

    this.startElements = args.startElements;
    this.optionalElements = args.optionalElements;
    this.restElement = args.restElement;
    this.endElements = args.endElements;

    if (this.optionalElements.length > 0 && this.endElements.length > 0) {
      throw new TypeError(
        [
          "Cannot create TupleCake with non-empty optionalElements and",
          "non-empty endElements, because required elements cannot appear",
          "after optional elements in a tuple type.",
        ].join(" ")
      );
    }
  }

  minLength(): number {
    return this.startElements.length + this.endElements.length;
  }

  maxLength(): number | null {
    if (this.restElement !== null) {
      return null;
    }
    return (
      this.startElements.length +
      this.optionalElements.length +
      this.endElements.length
    );
  }

  elements(): [
    ...S,
    ...MapOptionalTag<O>,
    ...(R extends null ? [] : [RestTag<R>]),
    ...E
  ];

  elements(
    length: number
  ):
    | (
        | S[number]
        | OptionalTag<O[number]>
        | (R extends null ? never : RestTag<R>)
        | E[number]
      )[]
    | null;

  elements(
    length?: number
  ):
    | [
        ...S,
        ...MapOptionalTag<O>,
        ...(R extends null ? [] : [RestTag<R>]),
        ...E
      ]
    | (S[number] | OptionalTag<O[number]> | RestTag<R> | E[number])[]
    | null {
    if (length === undefined) {
      length =
        this.startElements.length +
        this.optionalElements.length +
        (this.restElement === null ? 0 : 1) +
        this.endElements.length;
    } else {
      if (length < this.minLength()) {
        // Too short.
        return null;
      }

      const maxLength = this.maxLength();
      if (maxLength !== null && length > maxLength) {
        // Too long.
        return null;
      }
    }

    const optionalCount = Math.min(
      this.optionalElements.length,
      length - this.startElements.length
    );

    const restCount =
      length -
      (this.startElements.length + optionalCount + this.endElements.length);

    const elements: (
      | S[number]
      | OptionalTag<O[number]>
      | RestTag<R>
      | E[number]
    )[] = [];

    for (const element of this.startElements) {
      elements.push(element);
    }

    for (let i = 0; i < optionalCount; i++) {
      elements.push(optional(this.optionalElements[i]));
    }

    if (restCount > 0) {
      const element = rest(this.restElement);
      for (let i = 0; i < restCount; i++) {
        elements.push(element);
      }
    }

    for (const element of this.endElements) {
      elements.push(element);
    }

    return elements;
  }

  dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null {
    if (!Array.isArray(value)) {
      return new NotAnArrayCakeError(this, value);
    }

    const elements = this.elements(value.length);
    if (elements === null) {
      return new TupleWrongLengthCakeError(this, value);
    }

    // TODO: check for excess properties and empty slots

    const { recurse } = context;

    const errors: Record<string, CakeError> = {};
    let hasError = false;

    for (let i = 0; i < elements.length; i++) {
      const [tag, elementCake] = elements[i].untag();
      const error =
        tag === "optional" && value[i] === undefined
          ? null
          : recurse(elementCake, value[i]);
      if (error !== null) {
        errors[i] = error;
        hasError = true;
      }
    }

    return hasError ? new TupleElementsCakeError(this, value, errors) : null;
  }

  dispatchStringify(context: CakeDispatchStringifyContext): string {
    const { recurse } = context;

    if (
      this.startElements.length === 0 &&
      this.optionalElements.length === 0 &&
      this.endElements.length === 0
    ) {
      if (this.restElement === null) {
        return "[]";
      } else {
        return `(${recurse(this.restElement)})[]`;
      }
    }

    const strings: string[] = [];
    for (const element of this.startElements) {
      strings.push(recurse(element));
    }
    for (const element of this.optionalElements) {
      strings.push(`((${recurse(element)}) | undefined)?`);
    }
    if (this.restElement !== null) {
      strings.push(`...(${recurse(this.restElement)})[]`);
    }
    for (const element of this.endElements) {
      strings.push(recurse(element));
    }
    return `[${strings.join(", ")}]`;
  }

  withName(name: string | null): TupleCake<S, O, R, E> {
    return new TupleCake({ ...this, name });
  }
}

/**
 * @public
 */
class NotAnArrayCakeError extends CakeError {
  constructor(readonly cake: Cake, readonly value: unknown) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { stringifyCake } = context;
    return `Value does not satisfy type '${stringifyCake(
      this.cake
    )}': value is not an array.`;
  }
}

/**
 * @public
 */
class TupleWrongLengthCakeError extends CakeError {
  constructor(
    readonly cake: TupleCake<
      readonly Cake[],
      readonly Cake[],
      Cake | null,
      readonly Cake[]
    >,
    readonly value: unknown[]
  ) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { stringifyCake } = context;
    const minLength = this.cake.minLength();
    const maxLength = this.cake.maxLength();

    let expectedLength: string;
    if (maxLength === null) {
      expectedLength = `at least ${minLength}`;
    } else if (minLength === maxLength) {
      expectedLength = `${minLength}`;
    } else {
      expectedLength = `${minLength}-${maxLength}`;
    }

    return `Value does not satisfy type '${stringifyCake(
      this.cake
    )}': expected ${expectedLength} element(s) but received ${
      this.value.length
    }.`;
  }
}

/**
 * @public
 */
class TupleElementsCakeError extends CakeError {
  constructor(
    readonly cake: TupleCake<
      readonly Cake[],
      readonly Cake[],
      Cake | null,
      readonly Cake[]
    >,
    readonly value: unknown,
    readonly errors: Record<string, CakeError>
  ) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { recurse, stringifyCake } = context;

    const description =
      this.cake.startElements.length === 0 &&
      this.cake.optionalElements.length === 0 &&
      this.cake.restElement !== null &&
      this.cake.endElements.length === 0
        ? "array"
        : "tuple";

    const message = `Value does not satisfy type '${stringifyCake(
      this.cake
    )}': ${description} elements are invalid.`;

    return [
      message,
      entriesUnsound(this.errors).map(([key, err]) =>
        prependStringTree(`Element ${key}: `, recurse(err))
      ),
    ];
  }
}

export {
  TupleCake,
  NotAnArrayCakeError,
  TupleWrongLengthCakeError,
  TupleElementsCakeError,
};
