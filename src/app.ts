import * as express from 'express';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.middleware();
  }

  private middleware() {
    this.express.use('/test', (req, res, next) => {
      res.send({ ok : true });
    });
  }
}

export default new App().express;