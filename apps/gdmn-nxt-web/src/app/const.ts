import { config } from '@gdmn-nxt/config';

// export const baseUrl = `https://${config.serverHost}${config.serverPort ? `:${config.serverPort}` : ''}/`;
console.log('const', config.serverHost);
export const baseUrl = `https://${config.serverHost}/`;
export const baseUrlApi = `${baseUrl}api/v1/`;
