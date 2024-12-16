import { ISessionInfo } from '@gsbelarus/util-api-types';
import { SessionData } from 'express-session';

const getSessionsById = async (
  userId: number,
  sessionStore: Express.SessionStore,
  currentSessionId: string
): Promise<ISessionInfo[]> => {
  const allSessions: SessionData[] = await new Promise((resolve, reject) => {
    sessionStore.all((error, results) => {
      if (error) return reject(error);
      if (!Array.isArray(results)) return reject('Not an array');

      else return resolve(results);
    });
  });

  if (!allSessions) return [];

  const userSessions = allSessions
    .filter(session => session.userId === userId)
    .map(({ id, ip, location, device, creationDate }) => ({
      id,
      ip,
      location,
      device,
      creationDate,
      current: id === currentSessionId
    }));

  return userSessions;
};

const closeSessionBySessionId = async (sessionId, sessionStore) => {
  sessionStore.destroy(sessionId);
};

export const securityService = {
  getSessionsById,
  closeSessionBySessionId
};
