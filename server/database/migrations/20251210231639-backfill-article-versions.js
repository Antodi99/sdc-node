'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const [articles] = await queryInterface.sequelize.query(
    `SELECT * FROM articles`
  );

  for (const art of articles) {
    const now = new Date();

    const [version] = await queryInterface.sequelize.query(
      `
      INSERT INTO article_versions
        (article_id, version, workspace_id, title, content, created_at, updated_at)
      VALUES
        (:articleId, 1, :workspaceId, :title, :content, :createdAt, :updatedAt)
      RETURNING id
      `,
      {
        replacements: {
          articleId: art.id,
          workspaceId: art.workspace_id,
          title: art.title || "Untitled",
          content: art.content || "",
          createdAt: art.created_at || now,
          updatedAt: art.updated_at || now,
        },
      }
    );

    const versionId = version[0].id;

    // Move attachments to first version
    await queryInterface.sequelize.query(
      `
      UPDATE attachments
      SET article_version_id = :versionId
      WHERE article_version_id IS NULL 
      AND article_id = :articleId
      `,
      { replacements: { versionId, articleId: art.id } }
    );
  }

  await queryInterface.changeColumn("attachments", "article_version_id", {
    type: Sequelize.INTEGER,
    allowNull: false,
  });
}

export async function down(queryInterface, Sequelize) {
}
