import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import { DbConnetion } from '../interfaces/DbConnectionInterface';

const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';

let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];
let db = null;

if (!db) {
  db = {};
  const operatorsAliases = false;
  config = Object.assign({ operatorsAliases }, config);
  const sequelize: Sequelize.Sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
  fs.readdirSync(__dirname)
    .filter((file: string) => {
      return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js') && (file !== basename)
    })
    .forEach((file: string) => {
      const model = sequelize.import(path.join(__dirname, file));
      db[model['name']] = model;
    });
  Object.keys(db)
    .forEach((modelName: string) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });
  db['sequelize'] = sequelize;
}

export default <DbConnetion>db;