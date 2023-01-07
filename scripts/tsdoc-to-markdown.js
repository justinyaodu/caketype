#!/usr/bin/env node

/**
 * Do some simple preprocessing to convert TSDoc comments to Markdown. This is
 * obviously not a proper parser; the goal is to reduce the amount of manual
 * editing required.
 */

/* eslint-disable @typescript-eslint/no-var-requires */

const { slugify, withLines } = require("./util");

function extractDocLines(lines) {
  const commentStart = /^\s*[/][*][*]\s*$/;
  const commentEnd = /^\s*[*][/]\s*$/;

  if (
    lines.every((line) => !commentStart.test(line) && !commentEnd.test(line))
  ) {
    // No comment delimiters - assume the entire input is inside a comment.
    return lines;
  }

  // Each group contains the lines belonging to one comment.
  const lineGroups = [];

  let insideComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (commentStart.test(line)) {
      insideComment = true;
      lineGroups.push([]);
    } else if (commentEnd.test(line)) {
      insideComment = false;

      // Find the next line of code after the doc comment and prepend it to the
      // group, to help identify what code the comment is attached to.

      // Skip over line comments, like // eslint-disable-next-line.
      let index = i + 1;
      while (index < lines.length && /\s*[/][/]/.test(lines[index])) {
        index++;
      }

      // lines[index] might be undefined, but that's okay.
      lineGroups[lineGroups.length - 1].unshift(`\n<!-- ${lines[index]} -->`);
    } else if (insideComment) {
      lineGroups[lineGroups.length - 1].push(line);
    }
  }

  return lineGroups.flat();
}

function processDocLine(line) {
  line = line.replace(/^\s*[*][ ]?/, "");
  line = line.replaceAll(
    /[{]@link ([^}]+)[}]/g,
    (_, target) => `[${target}](#${slugify(target)})`
  );
  line = line.replaceAll(/@example[ ]?/g, "\n");
  line = line.replaceAll("@public", "");
  line = line.replaceAll("@remarks", "");
  line = line.replaceAll("@see", "\nSee");
  return line;
}

function processLines(lines) {
  for (const line of extractDocLines(lines)) {
    console.log(processDocLine(line));
  }
}

withLines(null, processLines);
