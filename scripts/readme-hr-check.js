#!/usr/bin/env node

/**
 * Ensure that horizontal rules in the API Reference section of README.md are
 * correctly used between sections.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const process = require("process");

const { withLines } = require("./util");

function isHorizontalRule(line) {
  return line === "---";
}

function isSectionHeading(line) {
  // Starts with exactly 3 or 4 #'s.
  return /^#{3,4}[^#]/.test(line);
}

function findErrors(lines, error) {
  const referenceStart = lines.indexOf("## API Reference");
  if (referenceStart === -1) {
    error("could not find start of API reference section");
    return;
  }

  for (let i = referenceStart + 1; i < lines.length; i++) {
    const lineNum = i + 1;
    if (isHorizontalRule(lines[i])) {
      const j = i + 2;
      if (!(j in lines) || !isSectionHeading(lines[j])) {
        error(`line ${lineNum}: extraneous horizontal rule`);
      }
    }
    if (isSectionHeading(lines[i])) {
      const j = i - 2;
      if (!(j in lines) || !isHorizontalRule(lines[j])) {
        error(`line ${lineNum}: missing horizontal rule before heading`);
      }
    }
  }
}

function processLines(lines) {
  let exitCode = 0;
  function error(message) {
    console.error(message);
    exitCode = 1;
  }

  console.log(
    "Checking horizontal rules in API Reference section of README.md..."
  );
  findErrors(lines, error);
  if (exitCode === 0) {
    console.log("Horizontal rules OK!");
  }

  process.exit(exitCode);
}

withLines(path.join(__dirname, "..", "README.md"), processLines);
