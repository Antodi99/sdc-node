import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Article, {
        foreignKey: "articleId",
        as: "article",
        onDelete: "CASCADE",
      });
    }
  }

  Comment.init(
    {
      articleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      author: DataTypes.STRING,
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
      underscored: true,
    }
  );

  return Comment;
};
