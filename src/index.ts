import * as http from 'http';
import app from './app';
import db from './models';
import { normalizePort, onListening, onError } from './utils/utils';

const server = http.createServer(app);
const port = normalizePort(process.env.PORT || 3000);
const host = process.env.host || '127.0.0.1';

db
  .sequelize
  .sync()
  .then(() => {
    server.listen(port, host);
    server.on('listening', onListening(server));
    server.on('error', onError(server));
  });
