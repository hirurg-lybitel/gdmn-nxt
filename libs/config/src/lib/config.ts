interface IConfig {
  host: string;
  serverPort: number;
  notificationPort: number;
  streamingUpdatePort: number;
  appPort: number;
  env?: string;
}

const host = (() => {
  return process.env.NODE_ENV === 'development'
    ? 'localhost'
    : process.env.NX_HOST_IP || '';
})();

const serverPort = (() => {
  return process.env.NODE_ENV === 'development'
  ? Number(process.env.NX_GDMN_DEV_NXT_SERVER_PORT)
  : Number(process.env.NX_GDMN_NXT_SERVER_PORT);
})();

const notificationPort =
  process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SOCKET_NOTIFICATIONS_PORT)
    : Number(process.env.NX_SOCKET_NOTIFICATIONS_PORT);

const streamingUpdatePort =
  process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SOCKET_STREAMING_UPDATE_PORT)
    : Number(process.env.NX_SOCKET_STREAMING_UPDATE_PORT);

const appPort = (() => {
  return process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_APP_PORT)
    : Number(process.env.NX_GDMN_NXT_SERVER_PORT);
})();


export const config: IConfig = {
  host,
  serverPort,
  notificationPort,
  streamingUpdatePort,
  appPort,
  env: process.env.NODE_ENV || '123'
};
