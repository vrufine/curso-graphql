import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import schema from './graphql/schema';
import db from './models';

class App {
  public express: express.Application;
  constructor() {
    this.express = express();
    this.middleware();
  }
  private middleware() {
    this.express.use('/graphql',
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        req['context'] = {};
        req['context']['db'] = db;
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