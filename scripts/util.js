function slugify(text) {
  return text
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[^a-z0-9-]/g, "");
}

module.exports = {
  slugify,
};
