#!/usr/bin/env node

/**
 * Generate a table of contents from Markdown headings.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const process = require("process");
const readline = require("readline");

const { slugify } = require("./util");

function extractHeadings(lines) {
  return lines.filter((line) => line.startsWith("#"));
}

function processHeading(line) {
  return line.replace(
    /^(#+) (.*)$/,
    (_, hashes, text) =>
      `${"  ".repeat(hashes.length)}- [${text}](#${slugify(text)})`
  );
}

function processLines(lines) {
  for (const line of extractHeadings(lines)) {
    console.log(processHeading(line));
  }
}

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
  });

  const lines = [];
  rl.on("line", (line) => lines.push(line));
  rl.on("close", () => processLines(lines));
}

main();
