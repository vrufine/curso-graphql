import { Server } from "http";

export const normalizePort = (val: number | string): number => {
  return (typeof val === 'string') ? parseInt(val) : val;
}

export const onError = (server: Server) => {
  return (error: NodeJS.ErrnoException): void => {
    let port: number | string = server.address().port;
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof port === 'string') ? `pipe ${port}` : `port ${port}`;
    switch (error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
}

export const onListening = (server: Server) => {
  return (): void => {
    let addr = server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `http://${addr.address}:${addr.port}`;
    console.log(`Listening at ${bind}`);
  }
}

export const handleError = (error: Error) => {
  const errorMessage = `${error.name}: ${error.message}`;
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'pipelines') {
    console.log(errorMessage);
  }
  return Promise.reject(new Error(errorMessage));
}

export const throwError = (condition: boolean, message: string): void => {
  if (condition) throw new Error(message);
}

export const JWT_SECRET: string = process.env.JWT_SECRET || '3ss4p4$$w0rdEHz1k4';
