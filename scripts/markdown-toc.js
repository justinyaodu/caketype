#!/usr/bin/env node

/**
 * Generate a table of contents from Markdown headings.
 */

const { withLines, slugify } = require("./util");

/**
 * @param {string[]} lines
 * @returns {string[]}
 */
function extractHeadings(lines) {
  return lines.filter((line) => line.startsWith("#"));
}

/**
 * @param {string} text
 * @returns {string}
 */
function capsToTitleCase(text) {
  return text.replaceAll(
    /\b[A-Z-]+\b/g,
    (s) => s[0].toUpperCase() + s.slice(1).toLowerCase()
  );
}

/**
 * @param {string} line
 * @returns {string}
 */
function processHeading(line) {
  return line.replace(
    /^(#+) (.*)$/,
    (_, hashes, text) =>
      `${"  ".repeat(hashes.length)}- [${capsToTitleCase(text)}](#${slugify(
        text
      )})`
  );
}

/**
 * @param {string[]} lines
 * @returns {void}
 */
function processLines(lines) {
  for (const line of extractHeadings(lines)) {
    console.log(processHeading(line));
  }
}

withLines(null, processLines);
