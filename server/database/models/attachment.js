import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Attachment extends Model {
    static associate(models) {
      Attachment.belongsTo(models.Article, {
        foreignKey: "articleId",
        as: "article",
        onDelete: "CASCADE",
      });

      Attachment.belongsTo(models.ArticleVersion, {
        foreignKey: "articleVersionId",
        as: "version",
        onDelete: "CASCADE",
      });
    }
  }

  Attachment.init(
    {
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      articleVersionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      serverFilename: DataTypes.STRING,
      originalFilename: DataTypes.STRING,
      mimeType: DataTypes.STRING,
      uploadedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Attachment",
      tableName: "attachments",
      underscored: true,
    }
  );

  return Attachment;
};
