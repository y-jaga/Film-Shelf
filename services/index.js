const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");
const Wishlist = require("../models/Wishlist");
const CuratedListItem = require("../models/CuratedListItem");

const sortMoviesByWatchList = async (sortBy, order) => {
  //It contains all watchlists
  const watchList = await Watchlist.findAll();

  //It will contain all movies which are in watchlist
  const watchListMovies = [];

  for (const watchListObj of watchList) {
    const { movieId } = watchListObj;
    if (movieId)
      watchListMovies.push(await Movie.findOne({ where: { id: movieId } }));
  }

  //It will contain sorted watchlist movies.
  let sortedWatchListMovies;

  if (order.toLowerCase() === "asc") {
    sortedWatchListMovies = watchListMovies.sort(
      (watchListMovieObj1, watchListMovieObj2) =>
        watchListMovieObj1[sortBy] - watchListMovieObj2[sortBy]
    );
  } else if (order.toLowerCase() === "desc") {
    sortedWatchListMovies = watchListMovies.sort(
      (watchListMovieObj1, watchListMovieObj2) =>
        watchListMovieObj2[sortBy] - watchListMovieObj1[sortBy]
    );
  }

  return sortedWatchListMovies;
};

const sortMoviesByWishList = async (sortBy, order) => {
  //It contains all wishlists
  const wishList = await Wishlist.findAll();

  //It will contain all movies which are in wishList
  const wishListMovies = [];

  for (const wishListObj of wishList) {
    const { movieId } = wishListObj;
    if (movieId)
      wishListMovies.push(await Movie.findOne({ where: { id: movieId } }));
  }

  //It will contain sorted wishlist movies.
  let sortedWishListMovies;

  if (order.toLowerCase() === "asc") {
    sortedWishListMovies = wishListMovies.sort(
      (wishListMovieObj1, wishListMovieObj2) =>
        wishListMovieObj1[sortBy] - wishListMovieObj2[sortBy]
    );
  } else if (order.toLowerCase() === "desc") {
    sortedWishListMovies = wishListMovies.sort(
      (wishListMovieObj1, wishListMovieObj2) =>
        wishListMovieObj2[sortBy] - wishListMovieObj1[sortBy]
    );
  }

  return sortedWishListMovies;
};

const sortMoviesByCuratedListItem = async (sortBy, order) => {
  //It contains all CuratedListItems
  const curatedListItems = await CuratedListItem.findAll();

  //It will contain all movies which are in curatedListItems
  const curatedListItemsMovies = [];

  for (const curatedListItemObj of curatedListItems) {
    const { movieId } = curatedListItemObj;
    if (movieId)
      curatedListItemsMovies.push(
        await Movie.findOne({ where: { id: movieId } })
      );
  }

  //It will contain sorted curatedList movies.
  let sortedcuratedListMovies;

  if (order.toLowerCase() === "asc") {
    sortedcuratedListMovies = curatedListItemsMovies.sort(
      (curatedListItemMovieObj1, curatedListItemMovieObj2) =>
        curatedListItemMovieObj1[sortBy] - curatedListItemMovieObj2[sortBy]
    );
  } else if (order.toLowerCase() === "desc") {
    sortedcuratedListMovies = curatedListItemsMovies.sort(
      (curatedListItemMovieObj1, curatedListItemMovieObj2) =>
        curatedListItemMovieObj2[sortBy] - curatedListItemMovieObj1[sortBy]
    );
  }

  return sortedcuratedListMovies;
};

module.exports = {
  sortMoviesByWatchList,
  sortMoviesByWishList,
  sortMoviesByCuratedListItem,
};
