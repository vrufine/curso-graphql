import * as DataLoader from 'dataloader';

import { DbConnetion } from "../../interfaces/DbConnectionInterface";
import { DataLoaders } from "../../interfaces/DataLoadersInterface";

import { UserInstance } from '../../models/UserModel';
import { PostInstance } from '../../models/PostModel';
import { UserLoader } from './UserLoader';
import { PostLoader } from './PostLoader';

export class DataLoaderFactory {
  constructor(
    private db: DbConnetion
  ) { }

  public getLoaders(): DataLoaders {
    return {
      userLoader: new DataLoader<number, UserInstance>(
        (ids: number[]) => UserLoader.batchUsers(this.db.User, ids)
      ),
      postLoader: new DataLoader<number, PostInstance> (
        (ids: number[]) => PostLoader.batchPosts(this.db.Post, ids)
      )
    }
  }
}
