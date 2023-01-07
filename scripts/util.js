/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const process = require("process");
const readline = require("readline");

/**
 * Read every line of input from the provided path or stdin, then call the
 * callback with those lines.
 */
function withLines(path, callback) {
  const rl = readline.createInterface({
    input: path ? fs.createReadStream(path) : process.stdin,
  });
  const lines = [];
  rl.on("line", (line) => lines.push(line));
  rl.on("close", () => callback(lines));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[^a-z0-9-]/g, "");
}

module.exports = {
  withLines,
  slugify,
};
