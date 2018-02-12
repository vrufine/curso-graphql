import { GraphQLResolveInfo } from "graphql";
import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { PostInstance } from "../../../models/PostModel";

export const postResolvers = {
  Post: {
    author(
      post,
      args,
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.User.findById(post.get('author'));
    },
    comments(
      post,
      { first = 10, offset = 0 },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.Comment.findAll({
        where: { post: post.get('id') },
        limit: first,
        offset
      });
    }
  },
  Query: {
    posts(
      parent,
      { first = 10, offset = 0 },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.Post.findAll({
        limit: first,
        offset
      });
    },
    post(
      parent,
      { id },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      id = parseInt(id);
      return db.Post.findById(id)
        .then((post: PostInstance) => {
          if (!post) throw new Error(`Post with id ${id} not found!`);
          return post;
        });
    }
  },
  Mutation: {}
};