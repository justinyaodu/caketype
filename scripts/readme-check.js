#!/usr/bin/env node

/**
 * Run various checks on the content and formatting of README.md.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const process = require("process");

const { slugify, withLines } = require("./util");

/**
 * Ensure that heading anchors do not conflict, and that links to heading
 * anchors are all valid.
 */
function findHeadingAnchorErrors(lines, error) {
  // Add entries set to undefined to ignore conflicts for these headings.
  const anchors = new Map([
    ["added", undefined],
    ["changed", undefined],
    ["removed", undefined],
  ]);

  for (let i = 0; i < lines.length; i++) {
    const match = /^#+ (.*)$/.exec(lines[i]);
    if (match) {
      const anchor = slugify(match[1]);
      if (anchors.get(anchor) !== undefined) {
        error(
          i,
          `heading anchor conflicts with previous heading on line ${
            anchors.get(anchor) + 1
          }`
        );
      } else if (!anchors.has(anchor)) {
        anchors.set(anchor, i);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    // Hack to iterate over all matches - we don't actually do any replacing.
    lines[i].replaceAll(/\]\(#([^)]+)\)/g, (_, anchor) => {
      if (!anchors.has(anchor)) {
        error(i, `broken anchor link ${JSON.stringify(anchor)}`);
      }
    });
  }
}

/**
 * Ensure that horizontal rules in the API reference section are correctly used
 * between sections.
 */
function findHorizontalRuleErrors(lines, error) {
  function isHorizontalRule(line) {
    return line === "---";
  }

  function isSectionHeading(line) {
    // Starts with exactly 3 or 4 #'s.
    return /^#{3,4}[^#]/.test(line);
  }

  const referenceStart = lines.indexOf("## API Reference");
  if (referenceStart === -1) {
    error(null, "could not find start of API reference section");
    return;
  }

  const changelogStart = lines.indexOf("## Changelog");
  if (changelogStart === -1) {
    error(null, "could not find start of changelog");
    return;
  }

  for (let i = referenceStart + 1; i < changelogStart; i++) {
    if (isHorizontalRule(lines[i])) {
      const j = i + 2;
      if (!(j in lines) || !isSectionHeading(lines[j])) {
        error(i, "extraneous horizontal rule");
      }
    }
    if (isSectionHeading(lines[i])) {
      const j = i - 2;
      if (!(j in lines) || !isHorizontalRule(lines[j])) {
        error(i, "missing horizontal rule before heading");
      }
    }
  }
}

function processLines(lines) {
  let exitCode = 0;
  function error(line, message) {
    console.error((line === null ? "" : `line ${line + 1}: `) + message);
    exitCode = 1;
  }

  console.log("Checking README.md...");
  findHeadingAnchorErrors(lines, error);
  findHorizontalRuleErrors(lines, error);
  if (exitCode === 0) {
    console.log("README.md OK!");
  }

  process.exit(exitCode);
}

withLines(path.join(__dirname, "..", "README.md"), processLines);
