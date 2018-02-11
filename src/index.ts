import * as http from 'http';
import app from './app';
import { normalizePort, onListening, onError } from './utils/utils';

const server = http.createServer(app);
const port = normalizePort(process.env.port || 3000);

server.listen(port);
server.on('listening', onListening(server));
server.on('error', onError(server));