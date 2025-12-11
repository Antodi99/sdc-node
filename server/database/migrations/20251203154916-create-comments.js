'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("comments", {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },

    article_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "articles", key: "id" },
      onDelete: "CASCADE",
    },

    author: Sequelize.STRING,
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("comments");
}
