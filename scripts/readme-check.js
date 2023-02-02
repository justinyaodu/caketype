#!/usr/bin/env node

/**
 * Run various checks on the content and formatting of README.md.
 */

const path = require("path");
const process = require("process");

const { slugify, withLines } = require("./util");

/**
 * @typedef {(pos: number | null, message: string) => void} ErrorHandler
 */

/**
 * Ensure that heading anchors do not conflict, and that links to heading
 * anchors are all valid.
 *
 * @param {string[]} lines
 * @param {ErrorHandler} error
 * @returns {void}
 */
function findHeadingAnchorErrors(lines, error) {
  // Add entries set to undefined to ignore conflicts for these headings.
  /** @type {Map<string, number | undefined>} */
  const anchors = new Map([
    ["added", undefined],
    ["changed", undefined],
    ["removed", undefined],
  ]);

  for (let i = 0; i < lines.length; i++) {
    const match = /^#+ (.*)$/.exec(lines[i]);
    if (match) {
      const anchor = slugify(match[1]);
      const existing = anchors.get(anchor);
      if (existing !== undefined) {
        error(
          i,
          `heading anchor conflicts with previous heading on line ${
            existing + 1
          }`
        );
      } else if (!anchors.has(anchor)) {
        anchors.set(anchor, i);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    // Hack to iterate over all matches -
    // we don't actually use the replaced string.
    lines[i].replaceAll(/\]\(#([^)]+)\)/g, (_, anchor) => {
      if (!anchors.has(anchor)) {
        error(i, `broken anchor link ${JSON.stringify(anchor)}`);
      }
      return "IGNORED";
    });
  }
}

/**
 * Ensure that horizontal rules are correctly used between sections.
 *
 * @param {string[]} lines
 * @param {ErrorHandler} error
 * @param {string} startLine
 * @param {string | null} endLine
 * @param {RegExp} [headingRegex]
 * @returns {void}
 */
function findHorizontalRuleErrors(
  lines,
  error,
  startLine,
  endLine,
  headingRegex = /^#/
) {
  /**
   * @param {string} line
   * @returns {boolean}
   */
  function isHorizontalRule(line) {
    return line === "---";
  }

  /**
   * @param {string} line
   * @returns {boolean}
   */
  function isSectionHeading(line) {
    return headingRegex.test(line);
  }

  const startIndex = lines.indexOf(startLine);
  if (startIndex === -1) {
    error(null, `could not find start: ${startLine}`);
    return;
  }

  const endIndex = endLine ? lines.indexOf(endLine) : lines.length;
  if (endIndex === -1) {
    error(null, `could not find end: ${endLine}`);
    return;
  }

  for (let i = startIndex + 1; i < endIndex; i++) {
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

/**
 * Ensure that pull request links match the link text.
 *
 * @param {string[]} lines
 * @param {ErrorHandler} error
 * @returns {void}
 */
function findPullRequestLinkErrors(lines, error) {
  for (let i = 0; i < lines.length; i++) {
    lines[i].replaceAll(/\[#(\d+)\]\(([^)]*)\)/g, (_, num, url) => {
      if (url !== `https://github.com/justinyaodu/caketype/pull/${num}`) {
        error(i, "pull request link text does not match URL");
      }
      return "IGNORED";
    });
  }
}

/**
 * @param {string[]} lines
 * @returns {void}
 */
function processLines(lines) {
  let exitCode = 0;

  /**
   * @param {number | null} pos
   * @param {string} message
   */
  function error(pos, message) {
    console.error((pos === null ? "" : `line ${pos + 1}: `) + message);
    exitCode = 1;
  }

  console.log("Checking README.md...");
  findHeadingAnchorErrors(lines, error);
  findHorizontalRuleErrors(lines, error, "## API Reference", "## Changelog");
  findHorizontalRuleErrors(lines, error, "## Changelog", null, /^#{2,3}[^#]/);
  findPullRequestLinkErrors(lines, error);
  if (exitCode === 0) {
    console.log("README.md OK!");
  }

  process.exit(exitCode);
}

withLines(path.join(__dirname, "..", "README.md"), processLines);
