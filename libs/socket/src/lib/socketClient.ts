import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './socketTypes';
// import { readFileSync } from 'fs';

// import path from 'path';
// import fs from 'fs';
// const certificate = fs.readFileSync(path.join(__dirname, '../../../sslcert', 'cert.pem'));

// const certificate = readFileSync('../../../sslcert/cert.pem');
// console.log('setSocketClient', fs.readFileSync('../../../sslcert/cert.pem'));

export let socketClient: Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketClients = {
  [key: string]: Socket<ServerToClientEvents, ClientToServerEvents>
}
type SocketOptions = {
  url: string;
  userId: number;
}
const socketClients: SocketClients = {};
export function setSocketClient(name: string, options: SocketOptions) {
  const url = options?.url || '';
  const userId = options?.userId || -1;

  if (!socketClients[name]) {
    socketClients[name] = io(
      url,
      {
        auth: {
          userId
        },
        secure: true,
        rejectUnauthorized: false,
        // ca: certificate.toString()
      });

    socketClients[name].on('disconnect', reason => {
      if (reason === 'io server disconnect') {
        /** The disconnection was initiated by the server, you need to reconnect manually */
        socketClients[name].connect();
      }
      socketClients[name].removeAllListeners();
    });
  }

  return socketClients[name];
}

export function getSocketClient(name: string) {
  return socketClients[name];
}

export function clearSocket(name: string) {
  const socket = socketClients[name];
  if (!socket?.connected) return;

  socket.removeAllListeners();
  socket.disconnect();

  delete socketClients[name];
}
