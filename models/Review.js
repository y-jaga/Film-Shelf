const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define("Review", {
  movieId: {
    type: DataTypes.INTEGER,
    references: { model: "Movies", key: "id" },
  },
  rating: DataTypes.FLOAT, // User rating
  reviewText: DataTypes.STRING, // User review
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

Review.associate = (models) => {
  //one review belongs to one movie
  Review.belongsTo(models.Movie, {
    foreignKey: "movieId",
  });
};

module.exports = Review;
