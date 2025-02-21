const request = require("supertest");
const axiosInstance = require("../axios/axios.lib");
const app = require("../index");
const CuratedList = require("../models/CuratedList");
const Movie = require("../models/Movie");
const Wishlist = require("../models/Wishlist");
const Watchlist = require("../models/Watchlist");
const CuratedListItem = require("../models/CuratedListItem");
const Review = require("../models/Review");
const { Op } = require("sequelize");

const { searchMovie } = require("../controllers/moviesController");
const {
  isFloatBetween0And10,
  max500Character,
  validateSortMovie,
} = require("../validations/index");

let server;

beforeAll(() => {
  server = app.listen(0, () => {
    console.log("Test server running on port 0");
  });
});

afterAll((done) => {
  server.close(done);
});

jest.mock("../axios/axios.lib");
jest.mock("../models/CuratedList");
jest.mock("../models/Movie");
jest.mock("../validations/index");

describe("cineCuration unit and integartion tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET /api/movies/search, should get movies with actors for a valid query", async () => {
    const mockMovieResponse = {
      data: {
        results: [
          {
            id: 27205,
            title: "Inception",
            genre_ids: [28, 878, 12],
            release_date: "2010-07-16",
            vote_average: 8.4,
            overview: "Cobb, a skilled thief...",
          },
        ],
      },
    };

    const mockActorResponse = {
      data: {
        cast: [{ name: "Leonardo DiCaprio" }, { name: "Joseph Gordon-Levitt" }],
      },
    };

    axiosInstance.get
      .mockResolvedValueOnce(mockMovieResponse)
      .mockResolvedValueOnce(mockActorResponse);

    const req = { query: { query: "Inception" } };
    const res = { json: jest.fn(), status: jest.fn(() => res) };

    await searchMovie(req, res);

    expect(axiosInstance.get).toHaveBeenCalledWith("/search/movie", {
      params: {
        query: "Inception",
        api_key: process.env.TMDB_API_KEY,
      },
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/movie/27205/credits", {
      params: {
        api_key: process.env.TMDB_API_KEY,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      movies: [
        {
          title: "Inception",
          tmdbId: 27205,
          genre: "28, 878, 12",
          actors: "Leonardo DiCaprio, Joseph Gordon-Levitt",
          releaseYear: "2010",
          rating: 8.4,
          description: "Cobb, a skilled thief...",
        },
      ],
    });
  });

  it("POST /api/curated-lists, should create a new curated list with a name, description, and slug", async () => {
    const mockResponse = {
      id: 1,
      name: "Horror Movies",
      slug: "horror-movies",
      description: "A collection of the best horror films.",
    };

    CuratedList.create.mockResolvedValue(mockResponse);

    const response = await request(server).post("/api/curated-lists").send({
      name: "Horror Movies",
      slug: "horror-movies",
      description: "A collection of the best horror films.",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toEqual("Curated list created successfully.");
    expect(response.body.curatedList).toEqual(mockResponse);
    expect(CuratedList.create).toHaveBeenCalledWith({
      name: "Horror Movies",
      slug: "horror-movies",
      description: "A collection of the best horror films.",
    });
  });

  it("PUT /api/curated-lists/:curatedListId, should rename a list and add a short description in a curatedList", async () => {
    const mockCuratedList = {
      update: jest.fn(),
      save: jest.fn(),
    };

    CuratedList.findByPk = jest.fn().mockResolvedValue(mockCuratedList);

    const response = await request(server).put("/api/curated-lists/1").send({
      name: "Updated List Name",
      description: "Updated description.",
    });

    expect(CuratedList.findByPk).toHaveBeenCalledWith(1);
    expect(mockCuratedList.update).toHaveBeenCalledWith(
      {
        name: "Updated List Name",
        description: "Updated description.",
      },
      { where: { id: 1 } }
    );
    expect(mockCuratedList.save).toHaveBeenCalledWith();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Curated list updated successfully.",
    });
  });

  it("POST /api/movies/wishlist, should save movie in wishlist if present in Movie table", async () => {
    const mockMovie = {
      id: 1,
      tmdbId: 27205,
    };

    const mockWishlist = {
      id: 1,
      movieId: 1,
    };

    //since two time findOne used and both time mockMovie returned as response.
    Movie.findOne = jest
      .fn()
      .mockResolvedValue(mockMovie)
      .mockResolvedValue(mockMovie);

    Wishlist.create = jest.fn().mockResolvedValue(mockWishlist);

    const response = await request(server).post("/api/movies/wishlist").send({
      movieId: 27205,
    });

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { tmdbId: 27205 } });

    expect(Wishlist.create).toHaveBeenCalledWith({ movieId: 1 });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      message: "Movie added to wishlist successfully.",
      wishlist: mockWishlist,
    });
  });

  it("POST /api/movies/wishlist, should create a new movie and add it to the wishlists", async () => {
    const mockMovieResponse = {
      data: {
        original_title: "Inception",
        id: 27205,
        genres: [
          {
            id: 28,
            name: "Action",
          },
          {
            id: 878,
            name: "Science Fiction",
          },
          {
            id: 12,
            name: "Adventure",
          },
        ],
        release_date: "2010-07-15",
        vote_average: 8.4,
        overview: "Cobb, a skilled thief who commits corporate...",
      },
    };

    const mockActorResponse = {
      data: {
        cast: [
          { original_name: "Leonardo DiCaprio" },
          { original_name: "Joseph Gordon-Levitt" },
          { original_name: "渡辺謙" },
          { original_name: "Tom Hardy" },
          { original_name: "Elliot Page" },
        ],
      },
    };

    Movie.findOne.mockResolvedValue(null);

    axiosInstance.get
      .mockResolvedValueOnce(mockMovieResponse)
      .mockResolvedValueOnce(mockActorResponse);

    Movie.create.mockResolvedValue({
      id: 1,
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.4,
      description: "Cobb, a skilled thief who commits corporate...",
    });

    const response = await request(app)
      .post("/api/movies/wishlist")
      .send({ movieId: 27205 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Movie created successfully.",
      movie: {
        id: 1,
        title: "Inception",
        tmdbId: 27205,
        genre: "Action, Science Fiction, Adventure",
        actors:
          "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
        releaseYear: 2010,
        rating: 8.4,
        description: "Cobb, a skilled thief who commits corporate...",
      },
    });
    expect(Movie.create).toHaveBeenCalledWith({
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.4,
      description: "Cobb, a skilled thief who commits corporate...",
    });
    expect(axiosInstance.get).toHaveBeenCalledWith("/movie/27205", {
      params: {
        api_key: process.env.TMDB_API_KEY,
      },
    });
    expect(axiosInstance.get).toHaveBeenCalledWith("/movie/27205/credits", {
      params: {
        api_key: process.env.TMDB_API_KEY,
      },
    });
  });

  it("POST /api/movies/watchlist, should save movie in watchlist if present in Movie table", async () => {
    const mockMovieResponse = {
      id: 1,
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.4,
      description: "Cobb, a skilled thief who commits corporate...",
    };

    const mockWatchListResponse = {
      id: 1,
      movieId: 1,
    };

    Movie.findOne
      .mockResolvedValue(mockMovieResponse)
      .mockResolvedValue(mockMovieResponse);

    // Watchlist.create.mockResolvedValue(mockWatchListResponse);
    Watchlist.create = jest.fn().mockResolvedValue(mockWatchListResponse);

    const response = await request(app)
      .post("/api/movies/watchlist")
      .send({ movieId: 27205 });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      message: "Movie added to watchlist successfully.",
      watchList: mockWatchListResponse,
    });

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { tmdbId: 27205 } });

    expect(Watchlist.create).toHaveBeenCalledWith({ movieId: 1 });
  });

  it("POST /api/movies/watchlist, should create a new movie and add it to the watchlists", async () => {
    Movie.findOne.mockResolvedValue(null);

    const mockMovieDetailResponse = {
      data: {
        original_title: "Inception",
        id: 27205,
        genres: [
          {
            id: 28,
            name: "Action",
          },
          {
            id: 878,
            name: "Science Fiction",
          },
          {
            id: 12,
            name: "Adventure",
          },
        ],
        release_date: "2010-07-15",
        vote_average: 8.4,
        overview: "Cobb, a skilled thief who commits corporate espionage.",
      },
    };

    const mockActorResponse = {
      data: {
        cast: [
          { original_name: "Leonardo DiCaprio" },
          { original_name: "Joseph Gordon-Levitt" },
          { original_name: "渡辺謙" },
          { original_name: "Tom Hardy" },
          { original_name: "Elliot Page" },
        ],
      },
    };

    const mockMovieResponse = {
      id: 1,
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.4,
      description: "Cobb, a skilled thief who commits corporate espionage.",
    };

    axiosInstance.get
      .mockResolvedValueOnce(mockMovieDetailResponse)
      .mockResolvedValueOnce(mockActorResponse);

    Movie.create.mockResolvedValue(mockMovieResponse);

    const response = await request(app)
      .post("/api/movies/watchlist")
      .send({ movieId: 27205 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Movie created successfully.",
      movie: mockMovieResponse,
    });

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { tmdbId: 27205 } });

    expect(axiosInstance.get).toHaveBeenCalledWith("/movie/27205", {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/movie/27205/credits", {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    expect(Movie.create).toHaveBeenCalledWith({
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.4,
      description: "Cobb, a skilled thief who commits corporate espionage.",
    });
  });

  it("POST /api/movies/curated-list, should save movie in curated list if present in Movie table", async () => {
    const mockMovie = {
      id: 1,
      tmdbId: 27205,
    };

    const mockCuratedList = {
      id: 1,
      curatedListId: 1,
      movieId: 1,
    };

    Movie.findOne.mockResolvedValue(mockMovie).mockResolvedValue(mockMovie);

    CuratedListItem.create = jest.fn().mockResolvedValue(mockCuratedList);

    const response = await request(app)
      .post("/api/movies/curated-list")
      .send({ movieId: 27205, curatedListId: 1 });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      message: "Movie added to curated list item successfully.",
      curatedListItem: mockCuratedList,
    });

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { tmdbId: 27205 } });

    expect(CuratedListItem.create).toHaveBeenCalledWith({
      curatedListId: 1,
      movieId: 1,
    });
  });

  it("POST /api/movies/curated-list, should create a new movie and add it to the curatedListItems", async () => {
    const mockMovieDetail = {
      data: {
        original_title: "Inception",
        id: 27205,
        genres: [
          {
            id: 28,
            name: "Action",
          },
          {
            id: 878,
            name: "Science Fiction",
          },
          {
            id: 12,
            name: "Adventure",
          },
        ],
        release_date: "2010-07-15",
        vote_average: 8.4,
        overview: "Cobb, a skilled thief who commits corporate espionage.",
      },
    };

    const mockCastDetail = {
      data: {
        cast: [
          { original_name: "Leonardo DiCaprio" },
          { original_name: "Joseph Gordon-Levitt" },
          { original_name: "渡辺謙" },
          { original_name: "Tom Hardy" },
          { original_name: "Elliot Page" },
        ],
      },
    };

    const mockMovie = {
      id: 1,
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.4,
      description: "Cobb, a skilled thief who commits corporate espionage.",
    };

    Movie.findOne.mockResolvedValue(null);

    axiosInstance.get
      .mockResolvedValueOnce(mockMovieDetail)
      .mockResolvedValueOnce(mockCastDetail);

    Movie.create.mockResolvedValue(mockMovie);

    const response = await request(app)
      .post("/api/movies/curated-list")
      .send({ movieId: 27205, curatedListId: 1 });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      message: "Movie created successfully.",
      movie: mockMovie,
    });

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { tmdbId: 27205 } });

    expect(axiosInstance.get).toHaveBeenCalledWith("/movie/27205", {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    expect(axiosInstance.get).toHaveBeenCalledWith("/movie/27205/credits", {
      params: { api_key: process.env.TMDB_API_KEY },
    });

    expect(Movie.create).toHaveBeenCalledWith({
      title: "Inception",
      tmdbId: 27205,
      genre: "Action, Science Fiction, Adventure",
      actors:
        "Leonardo DiCaprio, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page",
      releaseYear: 2010,
      rating: 8.4,
      description: "Cobb, a skilled thief who commits corporate espionage.",
    });
  });

  it("POST /api/movies/:movieId/reviews, should add Reviews and Ratings to Movies", async () => {
    const mockRating = 4.5;
    const mockReviewText = "Great movie with a brilliant plot.";

    const mockReview = {
      id: 1,
      movieId: 8,
      rating: mockRating,
      reviewText: mockReviewText,
    };

    isFloatBetween0And10.mockResolvedValue(true);
    max500Character.mockResolvedValue(true);

    Review.create = jest.fn().mockResolvedValue(mockReview);

    const response = await request(app).post("/api/movies/8/reviews").send({
      rating: mockRating,
      reviewText: mockReviewText,
    });

    expect(response.status).toBe(201);

    expect(response.body.message).toEqual("Review added successfully.");

    expect(response.body.review).toEqual(mockReview);

    expect(isFloatBetween0And10).toHaveBeenCalledWith(mockRating);

    expect(max500Character).toHaveBeenCalledWith(mockReviewText);

    expect(Review.create).toHaveBeenCalledWith({
      movieId: 8,
      rating: mockRating,
      reviewText: mockReviewText,
    });
  });

  it("GET /api/movies/searchByGenreAndActor, should filter movies based on genre, actor", async () => {
    const mockGenre = "Action";
    const mockActor = "Leonardo DiCaprio";

    const mockMovie = [
      {
        id: 11,
        title: "Inception",
        tmdbId: 27205,
        genre: `${mockGenre}, Science Fiction, Adventure`,
        actors: `${mockActor}, Joseph Gordon-Levitt, 渡辺謙, Tom Hardy, Elliot Page`,
        releaseYear: 2010,
        rating: 8.369,
        description: "Cobb, a skilled thief who commits corporate ...",
      },
    ];

    Movie.findAll.mockResolvedValue(mockMovie);

    const response = await request(app)
      .get("/api/movies/searchByGenreAndActor")
      .query({ genre: mockGenre, actor: mockActor });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({ movies: mockMovie });

    expect(Movie.findAll).toHaveBeenCalledWith({
      where: {
        genre: { [Op.like]: `%${mockGenre}%` },
        actors: { [Op.like]: `%${mockActor}%` },
      },
    });
  });

  it("GET /api/movies/sort, should sort movies in watchlist by rating in ascending order.", async () => {
    const mockList = "watchlist";
    const mockSortBy = "rating";
    const mockOrder = "ASC";

    const mockWatchList = [
      {
        id: 1,
        movieId: 8,
      },
      {
        id: 2,
        movieId: 9,
      },
    ];

    const mockSortedMovies = [
      {
        id: 9,
        title: "Thor: Love and Thunder",
        releaseYear: 2022,
        rating: 6.44,
        description:
          "After his retirement is interrupted by Gorr the God Butcher...",
      },
      {
        id: 8,
        title: "Inception",
        releaseYear: 2010,
        rating: 8.369,
        description: "Cobb, a skilled thief who commits...",
      },
    ];

    validateSortMovie.mockResolvedValue([]);

    Watchlist.findAll = jest.fn().mockResolvedValue(mockWatchList);

    Movie.findOne
      .mockResolvedValueOnce({
        id: 8,
        title: "Inception",
        releaseYear: 2010,
        rating: 8.369,
        description: "Cobb, a skilled thief who commits...",
      })
      .mockResolvedValueOnce({
        id: 9,
        title: "Thor: Love and Thunder",
        releaseYear: 2022,
        rating: 6.44,
        description:
          "After his retirement is interrupted by Gorr the God Butcher...",
      });

    const response = await request(app).get(
      `/api/movies/sort?list=${mockList}&sortBy=${mockSortBy}&order=${mockOrder}`
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({ movies: mockSortedMovies });

    expect(validateSortMovie).toHaveBeenCalledWith({
      list: mockList,
      sortBy: mockSortBy,
      order: mockOrder,
    });

    expect(Watchlist.findAll).toHaveBeenCalledWith();

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { id: 8 } });

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { id: 9 } });
  });

  it("GET /api/movies/top5, should get the top 5 movies by rating and display their detailed reviews", async () => {
    const mockReview = [
      {
        movieId: 8,
        rating: 8.368,
        reviewText: "Great movie with a brilliant plot.",
      },
      {
        movieId: 9,
        rating: 6.769,
        reviewText: "Betest one.",
      },
      {
        movieId: 10,
        rating: 6.4,
        reviewText: "bestest movie ever seen.",
      },
    ];

    const mockMovies = [
      {
        title: "Inception",
        rating: 8.368,
        review: {
          text: "Great movie with a brilliant plot.",
          wordCount: 6,
        },
      },
      {
        title: "Thor",
        rating: 6.769,
        review: {
          text: "Betest one.",
          wordCount: 2,
        },
      },
      {
        title: "Thor: Love and Thunder",
        rating: 6.4,
        review: {
          text: "bestest movie ever seen.",
          wordCount: 4,
        },
      },
    ];

    Review.findAll = jest.fn().mockResolvedValue(mockReview);

    Movie.findOne
      .mockResolvedValueOnce({
        id: 8,
        title: "Inception",
      })
      .mockResolvedValueOnce({
        movieId: 9,
        title: "Thor",
      })
      .mockResolvedValueOnce({
        movieId: 10,
        title: "Thor: Love and Thunder",
      });

    const response = await request(app).get("/api/movies/top5");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      movies: mockMovies,
    });

    expect(Review.findAll).toHaveBeenCalledWith({
      order: [["rating", "DESC"]],
      limit: 5,
    });

    expect(Movie.findOne).toHaveBeenCalledWith({ where: { id: 8 } });
    expect(Movie.findOne).toHaveBeenCalledWith({ where: { id: 9 } });
    expect(Movie.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
  });
});
