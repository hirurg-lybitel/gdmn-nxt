import { RequestHandler } from 'express';
import { securityService } from '../service';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const getActiveSessions: RequestHandler = async (req, res) => {
  const userId = req.user['id'];
  try {
    const response = await securityService.getSessionsById(
      userId,
      req.sessionStore,
      req.sessionID
    );

    const result: IRequestResult = {
      queries: { activeSessions: [...response] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const closeSessionBySessionId: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await securityService.closeSessionBySessionId(
      id,
      req.sessionStore
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const securityController = {
  getActiveSessions,
  closeSessionBySessionId
};
