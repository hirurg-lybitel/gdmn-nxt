

import { Request } from 'express';

export function getSessionIdByUserId(userId: number, sessions) {
  const keys = Object.keys(sessions);
  for (const key of keys) {
    if (sessions[key].userId === userId) return key;
  }
  return null;
}

export const closeUserSession = async (req: Request, userIdToClose: number) => {
  const userId = req.user['id'];
  if (userId === userIdToClose) return;

  req.sessionStore.all((err, sessions) => {
    const sessionID = getSessionIdByUserId(userIdToClose, sessions);
    req.sessionStore.destroy(sessionID);
  });
};
