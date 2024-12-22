function isFloatBetween0And10(value) {
  return (
    typeof value === "number" &&
    value > 0 &&
    value < 10 &&
    !Number.isInteger(value)
  );
}

function max500Character(text) {
  let textWithoutSpace = text.replace(/\s/g, "");

  return textWithoutSpace.length < 500;
}

const validateSortMovie = (queryParams) => {
  const { list, sortBy, order } = queryParams;
  const errors = [];

  if (
    list.toLowerCase() != "watchlist" &&
    list.toLowerCase() != "wishlist" &&
    list.toLowerCase() != "curatedlist"
  ) {
    errors.push(
      "list parameter can be either watchlist or wishlist or curatedlist."
    );
  } else if (
    sortBy.toLowerCase() !== "rating" &&
    sortBy.toLowerCase() !== "releaseyear"
  ) {
    errors.push("sortBy can be either rating or releaseYear.");
  } else if (order.toLowerCase() !== "asc" && order.toLowerCase() !== "desc") {
    errors.push("order can be either asc or desc.");
  }

  return errors;
};

module.exports = { isFloatBetween0And10, max500Character, validateSortMovie };
