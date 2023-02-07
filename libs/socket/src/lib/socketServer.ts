import { Server } from 'socket.io';

export const socketServer = { ...Server };

// export function socketServer({ origin }: socketServerProps) {
//   return Server;
//   // return new Server<
//   //   ClientToServerEvents,
//   //   ServerToClientEvents,
//   //   InterServerEvents,
//   //   SocketData
//   // >({
//   //   cors: {
//   //     origin
//   //   }
//   // });
// };
