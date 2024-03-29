import {
  entriesIncludingSymbols,
  entriesUnsound,
  is_object,
  keysIncludingSymbols,
  stringifyPrimitive,
} from "../index-internal";

import {
  Cake,
  CakeDispatchCheckContext,
  CakeDispatchStringifyContext,
  CakeError,
  CakeErrorDispatchFormatContext,
  Infer,
  OptionalTag,
  StringTree,
  prependStringTree,
  CakeArgs,
} from "./index-internal";

/**
 * @public
 */
type ObjectCakeProperties = {
  readonly [key: string | symbol]: Cake | OptionalTag<Cake>;
};

/**
 * @public
 */
interface ObjectCakeArgs<P extends ObjectCakeProperties> extends CakeArgs {
  readonly properties: Readonly<P>;
}

// Helpers needed to circumvent error:
// "Two different types with this name exist, but they are unrelated".
type OnlyRequiredKeys<P extends ObjectCakeProperties> = keyof {
  [K in keyof P as P[K] extends OptionalTag<infer _> ? never : K]: P[K];
};
type OnlyOptionalKeys<P extends ObjectCakeProperties> = keyof {
  [K in keyof P as P[K] extends OptionalTag<infer _> ? K : never]: P[K];
};

/**
 * @public
 */
class ObjectCake<P extends ObjectCakeProperties>
  extends Cake<
    ({
      -readonly [K in OnlyRequiredKeys<P>]: P[K] extends Cake
        ? Infer<P[K]>
        : never;
    } & {
      -readonly [K in OnlyOptionalKeys<P>]?: P[K] extends OptionalTag<
        infer I extends Cake
      >
        ? Infer<I> | undefined
        : never;
    } extends infer I
      ? { [K in keyof I]: I[K] }
      : never) &
      object
  >
  implements ObjectCakeArgs<P>
{
  readonly properties: Readonly<P>;

  constructor(args: ObjectCakeArgs<P>) {
    super(args);
    this.properties = args.properties;
  }

  dispatchCheck(
    value: unknown,
    context: CakeDispatchCheckContext
  ): CakeError | null {
    if (!is_object(value)) {
      return new NotAnObjectCakeError(this, value);
    }

    const { recurse, getOption } = context;
    const errors: Record<string | symbol, CakeError> = {};
    let hasError = false;

    if (getOption(this, "objectExcessProperties") === "error") {
      for (const [key, propertyValue] of entriesIncludingSymbols(value)) {
        if (!(key in this.properties)) {
          errors[key] = new ExcessPropertyPresentCakeError(propertyValue);
          hasError = true;
        }
      }
    }

    for (const key of keysIncludingSymbols(this.properties)) {
      const error = this.checkProperty(value, key, recurse);
      if (error !== null) {
        errors[key] = error;
        hasError = true;
      }
    }
    return hasError ? new ObjectPropertiesCakeError(this, value, errors) : null;
  }

  private checkProperty(
    object: object,
    key: string | symbol,
    recurse: CakeDispatchCheckContext["recurse"]
  ): CakeError | null {
    const [tag, untagged] = this.properties[key].untag();
    const isOptional = tag === "optional";

    if (key in object) {
      const propertyValue = (object as Record<string | symbol, unknown>)[key];
      if (isOptional && propertyValue === undefined) {
        return null;
      }
      return recurse(untagged, propertyValue);
    } else {
      return isOptional ? null : new RequiredPropertyMissingCakeError(untagged);
    }
  }

  dispatchStringify(context: CakeDispatchStringifyContext): string {
    const { recurse } = context;
    const entries = keysIncludingSymbols(this.properties).map((key) => {
      const [tag, field] = this.properties[key].untag();
      const keyString = ObjectCake.stringifyKey(key);
      const fieldString = recurse(field);
      return tag === "optional"
        ? `${keyString}?: (${fieldString}) | undefined`
        : `${keyString}: ${fieldString}`;
    });
    return `{${entries.join(", ")}}`;
  }

  private static stringifyKey(key: string | symbol): string {
    if (typeof key === "symbol") {
      return `[${stringifyPrimitive(key)}]`;
    } else if (/^[_$A-Za-z_$][_$A-Za-z0-9]*$/.test(key)) {
      // Key is a valid identifier.
      return key;
    } else {
      return stringifyPrimitive(key);
    }
  }

  withName(name: string | null): ObjectCake<P> {
    return new ObjectCake({ ...this, name });
  }
}

/**
 * @public
 */
class NotAnObjectCakeError extends CakeError {
  constructor(readonly cake: Cake, readonly value: unknown) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { stringifyCake } = context;
    return `Value does not satisfy type '${stringifyCake(
      this.cake
    )}': value is not an object.`;
  }
}

/**
 * @public
 */
class ExcessPropertyPresentCakeError extends CakeError {
  constructor(readonly value: unknown) {
    super();
  }

  dispatchFormat(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeErrorDispatchFormatContext
  ): StringTree {
    return "Property is not declared in type and excess properties are not allowed.";
  }
}

/**
 * @public
 */
class RequiredPropertyMissingCakeError extends CakeError {
  constructor(readonly cake: Cake) {
    super();
  }

  dispatchFormat(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CakeErrorDispatchFormatContext
  ): StringTree {
    return "Required property is missing.";
  }
}

/**
 * @public
 */
class ObjectPropertiesCakeError extends CakeError {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly cake: ObjectCake<any>,
    readonly value: object,
    readonly errors: Record<string | symbol, CakeError>
  ) {
    super();
  }

  dispatchFormat(context: CakeErrorDispatchFormatContext): StringTree {
    const { recurse, stringifyCake } = context;
    return [
      `Value does not satisfy type '${stringifyCake(
        this.cake
      )}': object properties are invalid.`,
      entriesUnsound(this.errors).map(([key, err]) =>
        prependStringTree(`Property ${stringifyPrimitive(key)}: `, recurse(err))
      ),
    ];
  }
}

export {
  ObjectCake,
  ObjectCakeArgs,
  ObjectCakeProperties,
  NotAnObjectCakeError,
  ExcessPropertyPresentCakeError,
  ObjectPropertiesCakeError,
  RequiredPropertyMissingCakeError,
};
