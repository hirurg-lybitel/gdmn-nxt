export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  messages: (data: IMessage[]) => void;
  messagesByUser_response: (data: IMessage[]) => void;
  sendMessageToUsers_response: (status: number, statusText: string) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  delete: (notificationId: number) => void;
  messagesByUser_request: (userId: number) => void;
  sendMessageToUsers_request: (message: string, userIDs: number[]) => void;
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
