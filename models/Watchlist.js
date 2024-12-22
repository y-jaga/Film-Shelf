// models/watchlist.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Watchlist = sequelize.define("Watchlist", {
  movieId: {
    type: DataTypes.INTEGER,
    references: { model: "Movies", key: "id" },
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Watchlist.associate = (models) => {
  //one watchlist can be related to many movies
  Watchlist.belongsTo(models.Movie, {
    foreignKey: "movieId",
  });
};

module.exports = Watchlist;
