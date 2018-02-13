import { UserModel, UserInstance } from "../../models/UserModel";

export class UserLoader {
  static batchUsers(User: UserModel, ids: Array<number>): Promise<Array<UserInstance>> {
    return Promise.resolve(
      User.findAll({
        where: {
          id: {
            $in: ids
          }
        }
      })
    );
  }
}