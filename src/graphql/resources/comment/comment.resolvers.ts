import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { GraphQLResolveInfo } from "graphql";

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
  }
};