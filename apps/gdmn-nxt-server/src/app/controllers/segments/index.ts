import { RequestHandler } from 'express';
import { resultError } from '../../responseMessages';
import { segmentsRepository } from '@gdmn-nxt/repositories/segments';
import { IRequestResult } from '@gsbelarus/util-api-types';

const getAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const segments = await segmentsRepository.find(sessionID);

    const result: IRequestResult = {
      queries: { segments },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).send(resultError(error.message));
  }
};

// const getById


export const segmentsController = {
  getAll,
};
