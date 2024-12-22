"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Movies", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      tmdbId: { type: Sequelize.INTEGER, allowNull: false },
      genre: { type: Sequelize.TEXT },
      actors: { type: Sequelize.TEXT },
      releaseYear: { type: Sequelize.INTEGER },
      rating: { type: Sequelize.FLOAT },
      description: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Movies");
  },
};
