'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("articles", "workspace_id", {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: { model: "workspaces", key: "id" },
    onDelete: "CASCADE"
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("articles", "workspace_id");
}
