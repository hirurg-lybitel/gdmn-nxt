import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './socketTypes';

interface socketClientProps {
  url: string;
  userId: number;
};

export let socketClient: Socket<ServerToClientEvents, ClientToServerEvents>;

export function setSocketClient({ url, userId }: socketClientProps) {
  socketClient = io(
    url,
    {
      auth: {
        userId
      },
    }
  );
};
