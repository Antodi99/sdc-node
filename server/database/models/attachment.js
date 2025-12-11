import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Attachment extends Model {
    static associate(models) {
      Attachment.belongsTo(models.Article, {
        foreignKey: "articleId",
        as: "article",
      });
    }
  }

  Attachment.init(
    {
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
