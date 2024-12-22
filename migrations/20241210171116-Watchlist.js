"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Watchlists", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      movieId: {
        type: Sequelize.INTEGER,
        references: { model: "Movies", key: "id" },
        onDelete: "CASCADE",
      },
      addedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Watchlists");
  },
};
