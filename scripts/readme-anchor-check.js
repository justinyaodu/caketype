#!/usr/bin/env node

/**
 * Ensure that links to heading anchors are all valid.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const process = require("process");

const { slugify, withLines } = require("./util");

function findErrors(lines, error) {
  const anchors = new Set();
  for (const line of lines) {
    const match = /^#+ (.*)$/.exec(line);
    if (match) {
      anchors.add(slugify(match[1]));
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    // Hack to iterate over all matches - we don't actually do any replacing.
    lines[i].replaceAll(/\]\(#([^)]+)\)/g, (_, anchor) => {
      if (!anchors.has(anchor)) {
        error(`line ${lineNum}: broken anchor link ${JSON.stringify(anchor)}`);
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

  console.log("Checking links to heading anchors in README.md...");
  findErrors(lines, error);
  if (exitCode === 0) {
    console.log("Heading anchor links OK!");
  }

  process.exit(exitCode);
}

withLines(path.join(__dirname, "..", "README.md"), processLines);
