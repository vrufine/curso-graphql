import * as jwt from 'jsonwebtoken';
import { GraphQLResolveInfo } from "graphql";

import { DbConnetion } from "../../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { JWT_SECRET } from '../../../utils/utils';

export const tokenResolvers = {
  Mutation: {
    createToken(
      parent,
      { email, password },
      { db }: { db: DbConnetion },
      info: GraphQLResolveInfo
    ) {
      return db.User.findOne({
        where: { email },
        attributes: ['id', 'password']
      }).then((user: UserInstance) => {
        const errorMessage = 'Unauthorized, wrong email or password!'
        if (!user || user.isPassword(user.get('password'), password)) {
          throw new Error(errorMessage);
        }
        const payload = { sub: user.get('id') }
        return {
          token: jwt.sign(payload, JWT_SECRET)
        }
      })
    }
  }
}