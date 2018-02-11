import * as Sequelize from 'sequelize';
import { ModelsInterface } from "./ModelsInterface";

export interface DbConnetion extends ModelsInterface {
  sequelize: Sequelize.Sequelize;
}