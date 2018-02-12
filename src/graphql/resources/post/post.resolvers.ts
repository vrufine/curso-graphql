import { GraphQLResolveInfo } from "graphql";
import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { PostInstance } from "../../../models/PostModel";
import { Transaction } from "sequelize";

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
  Mutation: {
    createPost(
      parent,
      { input },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.create(input, { transaction: t });
      })
    },
    updatePost(
      parent,
      { id, input },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.findById(id)
          .then((post: PostInstance) => {
            if (!post) throw new Error(`Post with id ${id} not found!`);
            return post.update(input, { transaction: t });
          })
      })
    },
    deletePost(
      parent,
      { id },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      id = parseInt(id);
      return db.sequelize.transaction((t: Transaction) => {
        return db.Post.findById(id)
          .then((post: PostInstance) => {
            if (!post) throw new Error(`Post with id ${id} not found!`);
            return post.destroy({ transaction: t })
              .then(post => !!post);
          })
      })
    },
  }
};