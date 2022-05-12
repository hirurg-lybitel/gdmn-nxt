// TODO Вынести host в константы среды

/** ip сервера default localhost*/
const host = '192.168.31.233';

export const baseUrl = `http://${process.env.NODE_ENV === 'development' ? 'localhost' : host}:4444/`;
export const baseUrlApi = `${baseUrl}api/v1/`;
