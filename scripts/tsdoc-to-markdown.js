#!/usr/bin/env node

/**
 * Do some simple preprocessing to convert TSDoc comments to Markdown. This is
 * obviously not a proper parser; the goal is to reduce the amount of manual
 * editing required.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const process = require("process");
const readline = require("readline");

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

      // Read the line after the comment and prepend it to the group,
      // to help identify what code the comment is attached to.
      lineGroups[lineGroups.length - 1].unshift(`<!-- ${lines[i + 1]} -->`);
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
    (_, target) => `[${target}](#${target.toLowerCase().replace(".", "")})`
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

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
  });

  const lines = [];
  rl.on("line", (line) => lines.push(line));
  rl.on("close", () => processLines(lines));
}

main();