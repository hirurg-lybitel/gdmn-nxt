import { config } from '@gdmn-nxt/config';

/** Activity timeout until logout in ms. */
export const LOGOUT_TIMEOUT = 1000 * 60 * 60 * 12;

/** Duration of the push notification in ms. */
export const PUSH_NOTIFICATIONS_DURATION = 1000 * 60;

export const baseUrl = process.env.NODE_ENV === 'production'
  ? `https://${config.serverHost}/`
  : `https://${config.serverHost}:${config.serverPort}/`;
export const baseUrlApi = `${baseUrl}api/v1/`;
