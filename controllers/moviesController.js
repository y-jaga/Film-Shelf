require("dotenv").config();
const axiosInstance = require("../axios/axios.lib");
const { Op } = require("sequelize");
const Movie = require("../models/Movie");
const Wishlist = require("../models/Wishlist");
const Watchlist = require("../models/Watchlist");
const CuratedListItem = require("../models/CuratedListItem");
const { validateSortMovie } = require("../validations/index");

const { getTopFiveRatedReviews } = require("../controllers/reviewController");

const {
  sortMoviesByWatchList,
  sortMoviesByWishList,
  sortMoviesByCuratedListItem,
} = require("../services/index");

const getActors = async (movieId) => {
  const actorsResponse = await axiosInstance.get(`/movie/${movieId}/credits`, {
    params: {
      api_key: process.env.TMDB_API_KEY,
    },
  });

  //fetching actor name form cast array
  const cast = actorsResponse.data.cast;
  return cast.map(({ name }) => name);
};

const searchMovie = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query || query.length === 0) {
      return res.status(400).json({ error: "query parameter is missing." });
    }

    //get request to fetch all movie details excepts actor
    const movieResponse = await axiosInstance.get("/search/movie", {
      params: {
        query,
        //TMDB API expects the API key to be passed as a query parameter.
        api_key: process.env.TMDB_API_KEY,
      },
    });

    const movies = movieResponse.data.results;

    //fetching actor names from getActors() using axios.get() and add it in movieObj
    for (const movieObj of movies) {
      const { id } = movieObj;
      let actors = await getActors(id);
      actors = actors.join(", ");
      movieObj.actors = actors;
    }

    const moviesResults = [];

    for (const movieObj of movies) {
      let {
        title,
        id: tmdbId,
        genre_ids: genre,
        actors,
        release_date: releaseYear,
        vote_average: rating,
        overview: description,
      } = movieObj;

      genre = genre.join(", ");
      releaseYear = releaseYear.split("-")[0];

      moviesResults.push({
        title,
        tmdbId,
        genre,
        actors,
        releaseYear,
        rating,
        description,
      });
    }

    if (moviesResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for the given query." });
    }

    res.status(200).json({ movies: moviesResults });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ error: "Invalid TMDB API key." });
    }
    res.status(500).json({ error: "Failed to fetch movies." });
  }
};

//Check if the movie is present in movies table search based on tmdb id
const movieExistsInDB = async (tmdbId) => {
  const movieFound = await Movie.findOne({ where: { tmdbId } });

  if (!movieFound) return false; //movie not found
  return true;
};

//fetches movies and cast details using axios call then fetch all the deatils for Movie model
const fetchMovieDetails = async (movieId) => {
  try {
    const movieResponse = await axiosInstance.get(`/movie/${movieId}`, {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    const castResponse = await axiosInstance.get(`/movie/${movieId}/credits`, {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    let {
      original_title: title,
      id: tmdbId,
      genres: genre,
      release_date: releaseYear,
      vote_average: rating,
      overview: description,
    } = movieResponse.data;

    genre = genre.map((genreObj) => genreObj.name);
    genre = genre.join(", ");

    //extracting only year and coverting it to integer
    releaseYear = parseInt(releaseYear.split("-")[0], 10);

    //first five cast details then fetching actors then converting it into a string
    const castDetails = castResponse.data.cast.slice(0, 5);
    let actors = castDetails.map((castObj) => castObj.original_name);
    actors = actors.join(", ");

    const movieData = {
      title,
      tmdbId,
      genre,
      actors,
      releaseYear,
      rating,
      description,
    };

    return movieData;
  } catch (error) {
    console.error("Error fetching movie or cast details:", error.message);
    throw new Error("Failed to fethc movie and cast details.");
  }
};

const createMovie = async (movieId) => {
  try {
    const movieDetail = await fetchMovieDetails(movieId);

    const movieResponse = await Movie.create(movieDetail);

    return movieResponse;
  } catch (error) {
    throw new Error("Failed to create movie.");
  }
};

const saveMoviesInWishList = async (req, res) => {
  try {
    const movieId = parseInt(req.body.movieId);

    if (!movieId) {
      return res.status(400).json({ error: "movieId is missing." });
    }

    const isMoviePresent = await movieExistsInDB(movieId);

    //if movie is present in db, then simply add movieId in Wishlist
    if (isMoviePresent) {
      const { id } = await Movie.findOne({ where: { tmdbId: movieId } });

      const wishlist = await Wishlist.create({ movieId: id });

      return res
        .status(201)
        .json({ message: "Movie added to wishlist successfully.", wishlist });
    }
    //if movies is not present in DB, then fetch movie and actors details and add them in Movie table
    else {
      const movie = await createMovie(movieId);

      return res.status(201).json({
        message: "Movie created successfully.",
        movie,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Failed to save movies in wishlist or create movie.",
    });
  }
};

const saveMoviesInWatchList = async (req, res) => {
  try {
    const tmdbId = parseInt(req.body.movieId);

    if (!tmdbId) {
      return res.status(400).json({ error: "movieId is missing." });
    }

    const isMoviePresent = await movieExistsInDB(tmdbId);

    //if movie is present in db, then simply add movieId in Watchlist
    if (isMoviePresent) {
      const { id } = await Movie.findOne({ where: { tmdbId } });

      const watchList = await Watchlist.create({ movieId: id });

      return res
        .status(201)
        .json({ message: "Movie added to watchlist successfully.", watchList });
    }
    //if movies is not present in DB, then fetch movie and actors details and add them in Movie table
    else {
      const movie = await createMovie(tmdbId);

      return res.status(201).json({
        message: "Movie created successfully.",
        movie,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to save movies in wishlist or create movie." });
  }
};

const saveMoviesInCuratedListItem = async (req, res) => {
  try {
    const tmdbId = parseInt(req.body.movieId);
    const curatedListId = parseInt(req.body.curatedListId);

    const isMoviePresent = await movieExistsInDB(tmdbId);

    //if movie is present in db, then simply add movieId in curatedListItem
    if (isMoviePresent) {
      const { id } = await Movie.findOne({ where: { tmdbId } });

      const curatedListItem = await CuratedListItem.create({
        curatedListId,
        movieId: id,
      });

      return res.status(201).json({
        message: "Movie added to curated list item successfully.",
        curatedListItem,
      });
    }
    //if movies is not present in DB, then fetch movie and actors details and add them in Movie table
    else {
      const movie = await createMovie(tmdbId);

      return res.status(201).json({
        message: "Movie created successfully.",
        movie,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Failed to save movies in curatedListItem or create movie.",
    });
  }
};

const getMoviesByGenreAndActor = async (req, res) => {
  try {
    const { genre: searchGenre, actor: searchActor } = req.query;

    if (!searchGenre || !searchActor) {
      return res.status(400).json({ error: "genre or actors not provided." });
    }

    const movies = await Movie.findAll({
      where: {
        genre: { [Op.like]: `%${searchGenre}%` },
        actors: { [Op.like]: `%${searchActor}%` },
      },
    });

    if (movies.length === 0) {
      return res
        .status(400)
        .json({ error: "No movies found for this genre and actor." });
    }

    res.status(200).json({ movies });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to fetch movies by genre and actor." });
  }
};

//It allows users to sort movies in their lists by rating or year of release.
const sortMovies = async (req, res) => {
  try {
    const { list, sortBy, order } = req.query;

    const errors = validateSortMovie(req.query);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    let sortedMovies;

    if (list.toLowerCase() === "watchlist") {
      sortedMovies = await sortMoviesByWatchList(sortBy, order);
    } else if (list.toLowerCase() === "wishlist") {
      sortedMovies = await sortMoviesByWishList(sortBy, order);
    } else if (list.toLowerCase() === "curatedlist") {
      sortedMovies = await sortMoviesByCuratedListItem(sortBy, order);
    } else {
      return res.status(500).json({ error: "list parameter is not valid." });
    }

    res.status(200).json({ movies: sortedMovies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to sort movies." });
  }
};

const getTopRatedMovies = async (req, res) => {
  try {
    //fetches top 5 movies in descending order by rating.
    const topReviews = await getTopFiveRatedReviews();

    const movies = [];

    for (const reviewObj of topReviews) {
      let { movieId, rating, reviewText: text } = reviewObj;

      let wordCount = text.split(" ").length;
      let review = {
        text,
        wordCount,
      };

      let movie = await Movie.findOne({ where: { id: movieId } });

      let { title } = movie;

      movies.push({ title, rating, review });
    }

    res.status(200).json({ movies });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to fetch top 5 rated movies." });
  }
};

module.exports = {
  searchMovie,
  saveMoviesInWishList,
  saveMoviesInWatchList,
  saveMoviesInCuratedListItem,
  getMoviesByGenreAndActor,
  sortMovies,
  getTopRatedMovies,
  movieExistsInDB,
  fetchMovieDetails,
};
