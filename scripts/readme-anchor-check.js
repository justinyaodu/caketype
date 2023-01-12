#!/usr/bin/env node

/**
 * Ensure that heading anchors do not conflict, and that links to heading
 * anchors are all valid.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const process = require("process");

const { slugify, withLines } = require("./util");

function findErrors(lines, error) {
  const anchors = new Map();
  for (let i = 0; i < lines.length; i++) {
    const match = /^#+ (.*)$/.exec(lines[i]);
    if (match) {
      const anchor = slugify(match[1]);
      if (anchors.has(anchor)) {
        error(
          `line ${
            i + 1
          }: heading anchor conflicts with previous heading on line ${
            anchors.get(anchor) + 1
          }`
        );
      } else {
        anchors.set(anchor, i);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    // Hack to iterate over all matches - we don't actually do any replacing.
    lines[i].replaceAll(/\]\(#([^)]+)\)/g, (_, anchor) => {
      if (!anchors.has(anchor)) {
        error(`line ${i + 1}: broken anchor link ${JSON.stringify(anchor)}`);
      }
    });
  }
}

function processLines(lines) {
  let exitCode = 0;
  function error(message) {
    console.error(message);
    exitCode = 1;
  }

  console.log("Checking heading anchors in README.md...");
  findErrors(lines, error);
  if (exitCode === 0) {
    console.log("Heading anchors OK!");
  }

  process.exit(exitCode);
}

withLines(path.join(__dirname, "..", "README.md"), processLines);
