'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("article_versions", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },

    article_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "articles", key: "id" },
      onDelete: "CASCADE",
    },

    version: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    workspace_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "workspaces", key: "id" },
      onDelete: "RESTRICT",
    },

    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },

    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });

  await queryInterface.addConstraint("article_versions", {
    fields: ["article_id", "version"],
    type: "unique",
    name: "unique_article_version_per_article",
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable("article_versions");
}
