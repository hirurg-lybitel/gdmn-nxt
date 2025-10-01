import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './socketTypes';
import { UserType } from '@gsbelarus/util-api-types';

export let socketClient: Socket<ServerToClientEvents, ClientToServerEvents>;

type SocketClients = {
  [key: string]: Socket<ServerToClientEvents, ClientToServerEvents>;
};
type SocketOptions = {
  url: string;
  userId: number;
  userType?: UserType;
};
const socketClients: SocketClients = {};
export function setSocketClient(name: string, options: SocketOptions) {
  const url = options?.url || '';
  const userId = options?.userId || -1;
  const userType = options?.userType || UserType.Gedemin;

  if (!socketClients[name]) {
    socketClients[name] = io(
      url,
      {
        auth: {
          userId,
          userType
        },
        secure: true,
        rejectUnauthorized: false,
        withCredentials: true
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

export function getSocketClient(name: string): Socket<ServerToClientEvents, ClientToServerEvents> | undefined {
  return socketClients[name];
}

export function clearSocket(name: string) {
  const socket = socketClients[name];
  if (!socket?.connected) return;

  socket.removeAllListeners();
  socket.disconnect();

  delete socketClients[name];
}
