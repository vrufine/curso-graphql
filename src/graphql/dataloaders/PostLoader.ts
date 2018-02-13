import { PostModel, PostInstance } from "../../models/PostModel";

export class PostLoader {
  static batchPosts(Post: PostModel, ids: Array<number>): Promise<Array<PostInstance>> {
    return Promise.resolve(
      Post.findAll({
        where: {
          id: {
            $in: ids
          }
        }
      })
    );
  }
}
