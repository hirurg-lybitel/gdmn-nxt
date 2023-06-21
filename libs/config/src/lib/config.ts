interface IConfig {
  host: string;
  appPort: number;
  serverHost: string;
  serverPort: number;
  notificationPort: number;
  streamingUpdatePort: number;
  apiAccessToken: string;
  serverStaticMode: boolean;
}

/** Host where back/container is running  */
const host = (() => {
  return 'localhost';
})();

/** Listening host */
const serverHost = (() => {
  return 'localhost';
})();

/** Listening port */
const serverPort = (() => {
  return process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SERVER_PORT)
    : Number(process.env.NX_SERVER_PORT);
})();

const serverStaticMode: boolean =
  process.env.NODE_ENV === 'development'
    ? false
    : process.env.NX_SEVER_USE_STATIC_FILE === 'true';

const notificationPort =
  process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SOCKET_NOTIFICATIONS_PORT)
    : Number(process.env.NX_SOCKET_NOTIFICATIONS_PORT);

const streamingUpdatePort =
  process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SOCKET_STREAMING_UPDATE_PORT)
    : Number(process.env.NX_SOCKET_STREAMING_UPDATE_PORT);

const appPort =
  serverStaticMode
    ? serverPort
    : Number(process.env.NX_APP_PORT) ?? 80;

const apiAccessToken = process.env.ACCESS_TOKEN || '';

export const config: IConfig = {
  host,
  appPort,
  serverHost,
  serverPort,
  notificationPort,
  streamingUpdatePort,
  apiAccessToken,
  serverStaticMode
};
