interface IConfig {
  host: string;
  appPort: number;
  serverHost: string;
  serverPort: number;
  notificationPort: number;
  streamingUpdatePort: number;
  apiAccessToken: string;
}

/** Host where back/container is running  */
const host = (() => {
  return process.env.NODE_ENV === 'development'
    ? 'localhost'
    : process.env.NX_HOST_IP || '';
})();

/** Listening host */
const serverHost = (() => {
  return process.env.NODE_ENV === 'development'
    ? 'localhost'
    : process.env.NX_SERVER_HOST || '';
})();

/** Listening port */
const serverPort = (() => {
  return process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SERVER_PORT)
    : Number(process.env.NX_SERVER_PORT);
})();

const notificationPort =
  process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SOCKET_NOTIFICATIONS_PORT)
    : Number(process.env.NX_SOCKET_NOTIFICATIONS_PORT);

const streamingUpdatePort =
  process.env.NODE_ENV === 'development'
    ? Number(process.env.NX_DEV_SOCKET_STREAMING_UPDATE_PORT)
    : Number(process.env.NX_SOCKET_STREAMING_UPDATE_PORT);

const appPort = Number(process.env.NX_APP_PORT) ?? 80;

const apiAccessToken = process.env.ACCESS_TOKEN || '';

export const config: IConfig = {
  host,
  appPort,
  serverHost,
  serverPort,
  notificationPort,
  streamingUpdatePort,
  apiAccessToken
};
