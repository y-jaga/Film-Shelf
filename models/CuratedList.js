const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CuratedList = sequelize.define("CuratedList", {
  name: DataTypes.STRING,
  slug: DataTypes.STRING, // For public access
  description: DataTypes.STRING,
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

CuratedList.associate = (models) => {
  //one CuratedList belongs to many CuratedListItem
  CuratedList.hasMany(models.CuratedListItem, {
    foreignKey: "curatedListId",
  });
};

module.exports = CuratedList;
