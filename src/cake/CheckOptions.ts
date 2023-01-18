interface CheckOptions {
  readonly objectExcessProperties: "ignore" | "error";
}

const CheckOptions: {
  STRICT: CheckOptions;
  DEFAULT: CheckOptions;
} = {
  STRICT: {
    objectExcessProperties: "error",
  },
  DEFAULT: {
    objectExcessProperties: "ignore",
  },
};

export { CheckOptions };
