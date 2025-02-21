const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Movie = sequelize.define("Movie", {
  title: DataTypes.STRING,
  tmdbId: DataTypes.INTEGER, // TMDB Movie ID
  genre: DataTypes.TEXT,
  actors: DataTypes.TEXT,
  releaseYear: DataTypes.INTEGER,
  rating: DataTypes.FLOAT, // From TMDB
  description: DataTypes.TEXT,
});

Movie.associate = (models) => {
  //one movie can belongs to many watchlist
  Movie.hasMany(models.Watchlist, {
    foreignKey: "movieId",
  });

  //one movie can belongs to many wishlist
  Movie.hasMany(models.Wishlist, {
    foreignKey: "movieId",
  });

  //one movie can belongs to many reviews
  Movie.hasMany(models.Review, {
    foreignKey: "movieId",
  });

  //one movie can belongs to many CuratedListItem
  Movie.hasMany(models.CuratedListItem, {
    foreignKey: "movieId ",
  });
};

module.exports = Movie;
