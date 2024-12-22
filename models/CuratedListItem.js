const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CuratedListItem = sequelize.define("CuratedListItem", {
  curatedListId: {
    type: DataTypes.INTEGER,
    references: { model: "CuratedLists", key: "id" },
  },
  movieId: {
    type: DataTypes.INTEGER,
    references: { model: "Movies", key: "id" },
  },
  addedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

CuratedListItem.associate = (models) => {
  //one CuratedListItem belongs to one CuratedList
  CuratedListItem.belongsTo(models.CuratedList, {
    foreignKey: "curatedListId",
  });

  //one CuratedListItem belongs to one Movie
  CuratedListItem.belongsTo(models.Movie, {
    foreignKey: "movieId",
  });
};

module.exports = CuratedListItem;
