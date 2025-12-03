'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("workspaces", {
    id: {
      primaryKey: true,
      autoIncrement: true,
      type: Sequelize.INTEGER,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },

    label: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("workspaces");
}
