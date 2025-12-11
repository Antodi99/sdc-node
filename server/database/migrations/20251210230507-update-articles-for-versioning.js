'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("articles", "current_version", {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("articles", "current_version");
}
