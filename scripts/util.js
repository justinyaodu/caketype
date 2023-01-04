function slugify(text) {
  return text
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[^a-z-]/g, "");
}

module.exports = {
  slugify,
};
