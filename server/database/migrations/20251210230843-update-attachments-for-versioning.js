'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {

  await queryInterface.addColumn("attachments", "article_version_id", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });

  await queryInterface.addConstraint("attachments", {
    fields: ["article_version_id"],
    type: "foreign key",
    references: {
      table: "article_versions",
      field: "id",
    },
    onDelete: "CASCADE",
    name: "fk_attachments_version",
  });
}
export async function down(queryInterface) {
  await queryInterface.removeConstraint("attachments", "fk_attachments_version");
  await queryInterface.removeColumn("attachments", "article_version_id");
}
