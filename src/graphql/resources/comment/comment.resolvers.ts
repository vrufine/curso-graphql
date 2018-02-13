import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";

export const commentResolvers = {
  Comment: {
    user: (
      comment,
      args,
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) => {
      return db.User.findById(comment.get('user'))
        .catch(handleError);
    },
    post: (
      comment,
      args,
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) => {
      return db.Post.findById(comment.get('post'))
        .catch(handleError);
    }
  },
  Query: {
    commentsByPost: (
      parent,
      { postId, first = 10, offset = 10 },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) => {
      postId = parseInt(postId);
      return db.Comment.findAll({
        where: {
          post: postId
        },
        limit: first,
        offset
      }).catch(handleError);
    }
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