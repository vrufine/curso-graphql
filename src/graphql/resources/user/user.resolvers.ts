import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { UserInstance } from "../../../models/UserModel";

import { compose } from './../../composable/composable.resolver'
import { authResolvers } from "../../composable/auth.resolver";

import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

import { RequestedFields } from "../../ast/RequestedFields";
import { handleError, throwError } from "../../../utils/utils";


export const userResolvers = {
  User: {
    posts: (
      user: UserInstance,
      { first = 10, offset = 0 },
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      return context.db.Post.findAll({
        where: { author: user.get('id') },
        limit: first,
        offset,
        attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
      }).catch(handleError);
    }
  },
  Query: {
    users: (
      parent,
      { first = 10, offset = 0 },
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      return context.db.User.findAll({
        limit: first,
        offset,
        attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
      }).catch(handleError);
    },
    user: (
      parent,
      { id },
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      id = parseInt(id);
      return context.db.User.findById(id, {
        attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
      }).then((user: UserInstance) => {
        throwError(!user, `User with id ${id} not found!`);
        return user;
      }).catch(handleError);
    },
    currentUser: compose(...authResolvers)((
      parent,
      args,
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      return context.db.User.findById(context.authUser.id, {
        attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
      }).then((user: UserInstance) => {
        throwError(!user, `User with id ${context.authUser.id} not found!`);
        return user;
      }).catch(handleError);
    })
  },
  Mutation: {
    createUser: (
      parent,
      { input },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) => {
      return db.sequelize.transaction((t: Transaction) => {
        return db.User.create(input, { transaction: t });
      }).catch(handleError);
    },
    updateUser: compose(...authResolvers)((
      parent,
      { input },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      return db.sequelize.transaction((t: Transaction) => {
        return db.User.findById(authUser.id)
          .then((user: UserInstance) => {
            throwError(!user, `User with id ${authUser.id} not found!`);
            return user.update(input, { transaction: t });
          });
      }).catch(handleError);
    }),
    updateUserPassword: compose(...authResolvers)((
      parent,
      { input },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      return db.sequelize.transaction((t: Transaction) => {
        return db.User.findById(authUser.id)
          .then((user: UserInstance) => {
            throwError(!user, `User with id ${authUser.id} not found!`);
            return user.update(input, { transaction: t })
              .then((user: UserInstance) => !!user);
          });
      }).catch(handleError);
    }),
    deleteUser: compose(...authResolvers)((
      parent,
      args,
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      return db.sequelize.transaction((t: Transaction) => {
        return db.User.findById(authUser.id)
          .then((user: UserInstance) => {
            throwError(!user, `User with id ${authUser.id} not found!`);
            return user.destroy({ transaction: t })
              .then(user => !!user);
          });
      }).catch(handleError);
    })
  }
};
