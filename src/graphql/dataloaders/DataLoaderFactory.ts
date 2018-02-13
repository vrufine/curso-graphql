import * as DataLoader from 'dataloader';

import { DbConnetion } from "../../interfaces/DbConnectionInterface";
import { DataLoaders } from "../../interfaces/DataLoadersInterface";

import { UserInstance } from '../../models/UserModel';
import { PostInstance } from '../../models/PostModel';
import { UserLoader } from './UserLoader';
import { PostLoader } from './PostLoader';
import { RequestedFields } from '../ast/RequestedFields';
import { DataLoaderParam } from '../../interfaces/DataLoaderParamInterface';

export class DataLoaderFactory {
  constructor(
    private db: DbConnetion,
    private requestedFields: RequestedFields
  ) { }

  public getLoaders(): DataLoaders {
    return {
      userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
        (params: DataLoaderParam<number>[]) => UserLoader.batchUsers(this.db.User, params, this.requestedFields),
        { cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key }
      ),
      postLoader: new DataLoader<DataLoaderParam<number>, PostInstance> (
        (params: DataLoaderParam<number>[]) => PostLoader.batchPosts(this.db.Post, params, this.requestedFields),
        { cacheKeyFn: (param: DataLoaderParam<number[]>) => param.key }
      )
    }
  }
}
