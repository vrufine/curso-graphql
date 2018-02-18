import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { CommentInstance } from "../../../models/CommentModel";

import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";

import { handleError, throwError } from "../../../utils/utils";

export const commentResolvers = {
  Comment: {
    user: (
      comment,
      args,
      { db, dataloaders: { userLoader } }: { db: DbConnetion, dataloaders: DataLoaders },
      info: GraphQLResolveInfo
    ) => {
      return userLoader
      .load({ key: comment.get('user'), info })
        .catch(handleError);
    },
    post: (
      comment,
      args,
      { db, dataloaders: { postLoader } }: { db: DbConnetion, dataloaders: DataLoaders },
      info: GraphQLResolveInfo
    ) => {
      return postLoader
        .load({ key: comment.get('post'), info })
        .catch(handleError);
    }
  },
  Query: {
    commentsByPost: compose()((
      parent,
      { postId, first = 10, offset = 10 },
      context: ResolverContext,
      info: GraphQLResolveInfo
    ) => {
      postId = parseInt(postId);
      return context.db.Comment.findAll({
        where: { post: postId },
        limit: first,
        offset,
        attributes: context.requestedFields.getFields(info, {keep: undefined, exclude: undefined})
      }).catch(handleError);
    })
  },
  Mutation: {
    createComment: compose(...authResolvers)((
      parent,
      { input },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      input['user'] = authUser.id;
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.create(input, { transaction: t });
      }).catch(handleError);
    }),
    updateComment: compose(...authResolvers)((
      parent,
      { id, input },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
          .then((comment: CommentInstance) => {
            throwError(!comment, `Comment with id ${id} not found!`);
            throwError(comment.get('user') !== authUser.id, 'Unauthorized! You can only edit your own comments!');
            input['user'] = authUser.id;
            return comment.update(input, { transaction: t });
          })
      }).catch(handleError);
    }),
    deleteComment: compose(...authResolvers)((
      parent,
      { id },
      { db, authUser }: { db: DbConnetion, authUser: AuthUser },
      info: GraphQLResolveInfo
    ) => {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
          .then((comment: CommentInstance) => {
            throwError(!comment, `Comment with id ${id} not found!`);
            throwError(comment.get('user') !== authUser.id, 'Unauthorized! You can only delete your own comments!');
            return comment.destroy({ transaction: t })
              .then(comment => !!comment);
          })
      }).catch(handleError);
    })
  }
};
