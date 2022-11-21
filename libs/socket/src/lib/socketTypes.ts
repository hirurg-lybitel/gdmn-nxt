export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  message: (data: IMessage) => void;
  messages: (data: IMessage[]) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  delete: (notificationId: number) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export interface IMessage {
  id: number;
  date: Date;
  title: string;
  text: string;
};

export interface IUser {
  userId: number;
  socketId: string;
};

export interface INotification {
  id: number;
  date: Date;
  userId?: number;
  title: string;
  message: string;
}
