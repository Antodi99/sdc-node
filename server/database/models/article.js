import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Article extends Model {
    static associate(models) {
      Article.belongsTo(models.Workspace, {
        foreignKey: "workspaceId",
        as: "workspace"
      });

      Article.belongsTo(models.User, {
        foreignKey: "creatorId",
        as: "creator",
      });

      Article.hasMany(models.Comment, {
        foreignKey: "articleId",
        as: "comments",
        onDelete: "CASCADE",
      });

      Article.hasMany(models.ArticleVersion, {
        foreignKey: "articleId",
        as: "versions",
        onDelete: "CASCADE",
      });
    }
  }

  Article.init(
    {
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      workspaceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      currentVersion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: "Article",
      tableName: "articles",
      underscored: true,
    }
  );

  return Article;
};
