import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";

export const commentResolvers = {
  Comment: {
    user(
      comment,
      args,
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.User.findById(comment.get('user'));
    },
    post(
      comment,
      args,
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.Post.findById(comment.get('post'));
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
        where: { post: postId },
        limit: first,
        offset
      });
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
      });
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
      });
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
      });
    },
  }
};