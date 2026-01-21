'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("articles", "creator_id", {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: "users", key: "id" },
    onDelete: "SET NULL",
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("articles", "creator_id");
}
