import { makeExecutableSchema } from 'graphql-tools';

const users = [
  { id: 1, name: "João", email: "j@email.com"},
  { id: 2, name: "Maria", email: "m@email.com"},
  { id: 3, name: "José", email: "js@email.com"}
]

export default makeExecutableSchema({
  typeDefs: `
    type User {
      id: ID!
      name: String!
      email: String!
    }

    type Query {
      allUsers: [User!]!
    }

    type Mutation {
      createUser(name: String!, email: String!): User
    }
  `,
  resolvers: {
    Query: {
      allUsers () {
        return users;
      }
    },
    Mutation: {
      createUser(p, args) {
        const newUser = {
          id: users.length + 1,
          name: args.name,
          email: args.email
        };
        users.push(newUser);
        return newUser;
      }
    }
  }
})