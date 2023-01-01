/* eslint-disable tsdoc/syntax */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  ...require("./jest.config"),
  collectCoverage: false,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          exactOptionalPropertyTypes: true,
        },
      },
    ],
  },
};
