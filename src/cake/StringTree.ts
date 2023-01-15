/**
 * @public
 */
type StringTree = string | readonly [string, readonly StringTree[]];

function prependStringTree(prepend: string, tree: StringTree): StringTree {
  if (typeof tree === "string") {
    return prepend + tree;
  }
  return [prepend + tree[0], tree[1]];
}

export { StringTree, prependStringTree };
