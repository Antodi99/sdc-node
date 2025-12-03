'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("attachments", {
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

    server_filename: Sequelize.STRING,
    original_filename: Sequelize.STRING,
    mime_type: Sequelize.STRING,
    uploaded_at: Sequelize.DATE,

    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("attachments");
}
