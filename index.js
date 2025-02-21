const express = require("express");
const cors = require("cors");

const sequelize = require("./config/database");

const axiosInstance = require("./axios/axios.lib");

const {
  searchMovie,
  saveMoviesInWishList,
  saveMoviesInWatchList,
  saveMoviesInCuratedListItem,
  getMoviesByGenreAndActor,
  sortMovies,
  getTopRatedMovies,
} = require("./controllers/moviesController");

const {
  createCuratedList,
  updateNameAndDescription,
} = require("./controllers/curatedListController");

const { addReviewAndRating } = require("./controllers/reviewController");

const app = express();

app.use(express.json());
app.use(cors());

//To search movies from the TMDB API based on a query param
//API Call: http://localhost:3000/api/movies/search?query=Inception
app.get("/api/movies/search", searchMovie);

//To create a new curated list with a name, description, and slug.
//API Call: http://localhost:3000/api/curated-lists
app.post("/api/curated-lists", createCuratedList);

//To rename a list and add a short description in a curatedList.
//API Call: http://localhost:3000/api/curated-lists/:curatedListId
app.put("/api/curated-lists/:curatedListId", updateNameAndDescription);

//To save movie in wishlist if present in Movie, else create a new Movie
//API Call: http://localhost:3000/api/movies/wishlist
app.post("/api/movies/wishlist", saveMoviesInWishList);

//To save movie in watchlist if present in Movie, else create a new Movie
//API Call: http://localhost:3000/api/movies/watchlist
app.post("/api/movies/watchlist", saveMoviesInWatchList);

//To save movie in CuratedListItem if present in Movie, else create a new Movie
//API Endpoint: http://localhost:3000/api/movies/curated-list
app.post("/api/movies/curated-list", saveMoviesInCuratedListItem);

//To add Reviews and Ratings to Movies
//API Endpoint: http://localhost:3000/api/movies/:movieId/reviews
app.post("/api/movies/:movieId/reviews", addReviewAndRating);

//To filters movies based on genre, actor.
//API Enpdoint: http://localhost:3000/api/movies/searchByGenreAndActor?genre=Action&actor=Leonardo DiCaprio
app.get("/api/movies/searchByGenreAndActor", getMoviesByGenreAndActor);

//To allows users to sort movies in their lists by rating or year of release.
//API Endpoint: http://localhost:3000/api/movies/sort?list=watchlist&sortBy=rating&order=ASC
app.get("/api/movies/sort", sortMovies);

//To get the top 5 movies by rating and display their detailed reviews
//API Endpoint: http://localhost:3000/api/movies/top5
app.get("/api/movies/top5", getTopRatedMovies);

//=========Sample=======//
//API Endpoint: http://localhost:3000/api/movies/searchMovieBytmdbId?tmdbId=616037
// app.get("/api/movies/searchMovieBytmdbId", async (req, res) => {
//   try {
//     const tmdbId = parseInt(req.query.tmdbId);
//     const response = await axiosInstance.get(`/movie/${tmdbId}/credits`, {
//       params: { api_key: process.env.TMDB_API_KEY },
//     });

//     res.status(200).json({ movies: response.data });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Failed to fetch movies." });
//   }
// });

if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(() => console.log("Database successfully connected."))
    .catch((error) => console.log("Unable to connect to database", error));
}

module.exports = app;
