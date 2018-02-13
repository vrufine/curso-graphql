import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import db from './models';
import schema from './graphql/schema';

import { RequestedFields } from './graphql/ast/RequestedFields';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';

class App {
  public express: express.Application;
  private dataLoaderFactory: DataLoaderFactory;
  private requestedFields: RequestedFields;
  constructor() {
    this.express = express();
    this.init();
  }
  private init() {
    this.requestedFields = new RequestedFields();
    this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
    this.middleware();
  }
  private middleware() {
    this.express.use('/graphql',
      extractJwtMiddleware(),
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        req['context']['db'] = db;
        req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
        req['context']['requestedFields'] = this.requestedFields;
        next();
      },
      graphqlHTTP((req) => ({
        schema,
        graphiql: process.env.NODE_ENV === 'development',
        context: req['context']
      }))
    );
  }
}

export default new App().express;
