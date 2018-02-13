import * as graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { PostInstance } from "../../../models/PostModel";

import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";

import { handleError, throwError } from "../../../utils/utils";

export const postResolvers = {
  Post: {
    author: (
      post,
      args,
      { db, dataloaders: { userLoader } }: { db: DbConnetion, dataloaders: DataLoaders },
      info: GraphQLResolveInfo
    ) => {
      return userLoader
        .load(post.get('author'))
        .catch(handleError);
    },
    comments: (
      post,
      { first = 10, offset = 0 },
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      return context.db.Comment.findAll({
        where: { post: post.get('id') },
        limit: first,
        offset,
        attributes: context.requestedFields.getFields(info)
      }).catch(handleError);
    }
  },
  Query: {
    posts: (
      parent,
      { first = 10, offset = 0 },
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      return context.db.Post.findAll({
        limit: first,
        offset,
        attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
      }).catch(handleError);
    },
    post: (
      parent,
      { id },
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      id = parseInt(id);
      return context.db.Post.findById(id, {
        attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
      })
        .then((post: PostInstance) => {
          throwError(!post, `Post with id ${id} not found!`);
          return post;
        }).catch(handleError);
    }
  },
  Mutation: {
    createPost: compose(...authResolvers)((
      parent,
      { input },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      input['author'] = authUser.id;
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.create(input, { transaction: t });
      }).catch(handleError);
    }),
    updatePost: compose(...authResolvers)((
      parent,
      { id, input },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.findById(id)
          .then((post: PostInstance) => {
            throwError(!post, `Post with id ${id} not found!`);
            throwError(post.get('author') !== authUser.id, `Unauthorized! You can only edit your own posts!`);
            input['author'] = authUser.id;
            return post.update(input, { transaction: t });
          });
      }).catch(handleError);
    }),
    deletePost: compose(...authResolvers)((
      parent,
      { id },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.findById(id)
          .then((post: PostInstance) => {
            throwError(!post, `Post with id ${id} not found!`);
            throwError(post.get('author') !== authUser.id, `Unauthorized! You can only delete your own posts!`);
            return post.destroy({ transaction: t })
              .then(post => !!post);
          });
      }).catch(handleError);
    }),
  }
};
