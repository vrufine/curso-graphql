import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import db from './models';
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extract-jwt.middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';

class App {
  public express: express.Application;
  private dataLoaderFactory: DataLoaderFactory;
  constructor() {
    this.express = express();
    this.init();
  }
  private init() {
    this.dataLoaderFactory = new DataLoaderFactory(db);
    this.middleware();
  }
  private middleware() {
    this.express.use('/graphql',
      extractJwtMiddleware(),
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        req['context']['db'] = db;
        req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
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
