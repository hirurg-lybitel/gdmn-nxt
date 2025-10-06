

import { UserType } from '@gsbelarus/util-api-types';
import { Request } from 'express';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import { config } from '@gdmn-nxt/config';
import signature from 'cookie-signature';
import { sessionStore } from '../../main';

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

export const getUserSessionBySidAndSocket = async (userType: UserType, socket: Socket<any, any, any, any>): Promise<any> => {
  const rawCookie = socket.handshake.headers.cookie;
  const cookies = cookie.parse(rawCookie);

  if (!cookies) return;
  const sidCookieName = userType === UserType.Tickets ? 'ticketsSid' : 'Sid';
  let sid = cookies[sidCookieName];
  if (!sid?.startsWith('s:')) return;
  sid = signature.unsign(sid.slice(2), config.jwtSecret);
  if (!sid) return;

  return await sessionStore.get(sid, (err, session) => {
    return session?.passport?.user;
  });
};
