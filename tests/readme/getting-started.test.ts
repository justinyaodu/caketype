import {
  array,
  Assert,
  bake,
  boolean,
  Cake,
  CakeError,
  Equivalent,
  If,
  Infer,
  number,
  optional,
  string,
} from "../../src";
import type { FlagExactOptionalPropertyTypes } from "../../src/typescript-flags";
import { expectTypeError } from "../test-helpers";

test("Getting Started", () => {
  type Person = {
    name: string;
    age?: If<FlagExactOptionalPropertyTypes, number | undefined, number>;
  };

  const Person = bake({
    name: string,
    age: optional(number),
  } as const);

  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const alice: Person = { name: "Alice" };
  }

  {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bob: Person = {};
  }

  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const bob: Person = JSON.parse("{}");
  }

  {
    const alice = Person.as(JSON.parse('{"name": "Alice"}'));
    expect(alice).toStrictEqual({ name: "Alice" });

    expectTypeError(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const bob = Person.as(JSON.parse("{}"));
    }, [`Value does not satisfy type '{name: string, age?: (number) | undefined}': object properties are invalid.`, `  Property "name": Required property is missing.`].join("\n"));
  }

  {
    const alice = Person.as({ name: "Alice" });
    expect(alice).toStrictEqual({ name: "Alice" });

    expectTypeError(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const bob = Person.as({});
    }, [`Value does not satisfy type '{name: string, age?: (number) | undefined}': object properties are invalid.`, `  Property "name": Required property is missing.`].join("\n"));
  }

  {
    const alice = JSON.parse('{"name": "Alice"}');

    if (Person.is(alice)) {
      // Here, the type of alice is Person
      const _: Person = alice;
      expect<string>(alice.name).toStrictEqual("Alice");
    }
  }

  {
    const result = Person.check(JSON.parse('{"name": "Alice"}'));
    if (result.ok) {
      const _: Person = result.value;
      const alice = result.value;
      expect(alice.name).toStrictEqual("Alice");
    } else {
      const _: CakeError = result.error;
      console.error(result.error.toString());
      fail();
    }
  }

  {
    const carol = { name: "Carol", lovesCake: true };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const person: Person = carol;

    expectTypeError(
      () => Person.as(carol),
      [
        `Value does not satisfy type '{name: string, age?: (number) | undefined}': object properties are invalid.`,
        `  Property "lovesCake": Property is not declared in type and excess properties are not allowed.`,
      ].join("\n")
    );

    expect(Person.asShape(carol)).toStrictEqual({
      name: "Carol",
      lovesCake: true,
    });
  }

  {
    type InferredPerson = Infer<typeof Person>;
    type _ = Assert<Equivalent<Person, InferredPerson>>;
  }

  {
    const _: Cake<Person> = Person;
  }

  {
    type Account = {
      person: Person;
      friends: string[];
      settings: {
        sendNotifications: boolean;
      };
    };

    const Account = bake({
      person: Person,
      friends: array(string),
      settings: {
        sendNotifications: boolean,
      },
    } as const);

    type _ = Assert<Equivalent<Account, Infer<typeof Account>>>;
  }

  {
    expect(number.is(7)).toStrictEqual(true);
  }
});
