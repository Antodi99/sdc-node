import { readdirSync } from "fs";
import { join, dirname, basename as pathBasename } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import Sequelize, { DataTypes } from "sequelize";

const require = createRequire(import.meta.url);
const configFile = require("../../config/database.cjs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = pathBasename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Load all model files
const files = readdirSync(__dirname).filter(
  (file) =>
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.endsWith(".js") &&
    !file.endsWith(".test.js")
);

for (const file of files) {
  const modelModule = await import(join(__dirname, file));

  // Support both: export default and module.exports
  const modelFactory = modelModule.default || modelModule;
  const model = modelFactory(sequelize, DataTypes);
  db[model.name] = model;
}

// Run associations
for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
