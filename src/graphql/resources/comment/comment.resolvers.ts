import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError } from "../../../utils/utils";

export const commentResolvers = {
  Comment: {
    user(
      comment,
      args,
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.User.findById(comment.get('user'))
        .catch(handleError);
    },
    post(
      comment,
      args,
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.Post.findById(comment.get('post'))
        .catch(handleError);
    }
  },
  Query: {
    commentsByPost(
      parent,
      { postId, first = 10, offset = 10 },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
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
    createComment(
      parent,
      { input },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.create(input, { transaction: t });
      }).catch(handleError);
    },
    updateComment(
      parent,
      { id, input },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
          .then((comment: CommentInstance) => {
            if (!comment) throw new Error(`Comment with id ${id} not found!`);
            return comment.update(input, { transaction: t });
          })
      }).catch(handleError);
    },
    deleteComment(
      parent,
      { id },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Comment.findById(id)
          .then((comment: CommentInstance) => {
            if (!comment) throw new Error(`Comment with id ${id} not found!`);
            return comment.destroy({ transaction: t })
              .then(comment => !!comment);
          })
      }).catch(handleError);
    },
  }
};