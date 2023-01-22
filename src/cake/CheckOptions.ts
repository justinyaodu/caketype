interface CheckOptions {
  readonly objectExcessProperties: "ignore" | "error";
}

const CheckOptions: {
  STRICT: CheckOptions;
  LENIENT: CheckOptions;
} = {
  STRICT: {
    objectExcessProperties: "error",
  },
  LENIENT: {
    objectExcessProperties: "ignore",
  },
};

export { CheckOptions };
