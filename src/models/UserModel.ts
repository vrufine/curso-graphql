import * as Sequelize from 'sequelize';
import { hashSync, genSaltSync, compareSync } from 'bcryptjs';
import { BaseModelInterface } from '../interfaces/BaseModelInterface';

export interface UserAttributes {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface UserInstance extends UserAttributes, Sequelize.Instance<UserAttributes> {
  isPassword(encodedPassword: string, password: string): boolean;
};

export interface UserModel extends BaseModelInterface, Sequelize.Model<UserInstance, UserAttributes> { };

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): UserModel => {
  const User: UserModel = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    photo: {
      type: DataTypes.BLOB({
        length: 'long'
      }),
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate(user: UserInstance, options?: Sequelize.CreateOptions): void {
        const salt = genSaltSync();
        user.password = hashSync(user.password, salt);
      }
    }
  });
  User.prototype.isPassword = (encodedPassword: string, password: string): boolean => {
    return compareSync(encodedPassword, password);
  }
  return User;
};