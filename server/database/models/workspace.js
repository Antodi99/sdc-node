import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Workspace extends Model {
    static associate(models) {
      Workspace.hasMany(models.Article, {
        foreignKey: "workspaceId",
        as: "articles",
        onDelete: "RESTRICT",
      });
    }
  }

  Workspace.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: "Workspace",
      tableName: "workspaces",
      underscored: true,
    }
  );

  return Workspace;
};
