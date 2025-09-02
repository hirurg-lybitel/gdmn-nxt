import { ticketsHistoryService } from '../service/index';
import { RequestHandler } from 'express';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const ticketId = req.params.ticketId;

    if (!ticketId) {
      throw new Error('Не указан обязательный параметр ticketId');
    }

    const response = await ticketsHistoryService.findAll(
      sessionID,
      {
        ...req.query,
        ticketId
      },
    );

    const result: IRequestResult = {
      queries: { ...response },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const ticketsHistoryController = {
  findAll
};
