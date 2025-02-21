const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Wishlist = sequelize.define("Wishlist", {
  movieId: {
    type: DataTypes.INTEGER,
    references: { model: "Movies", key: "id" },
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Wishlist.associate = (models) => {
  //one wishlist can be related to one movie
  Wishlist.belongsTo(models.Movie, {
    foreignKey: "movieId",
  });
};

module.exports = Wishlist;
