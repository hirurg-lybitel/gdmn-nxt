import { ticketsStateService } from '../service/index';
import { RequestHandler } from 'express';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const response = await ticketsStateService.findAll(sessionID);

    const result: IRequestResult = {
      queries: { ...response },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const findOne: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const ticketState = await ticketsStateService.findOne(req.sessionID, id);
    return res.status(200).json(ticketState);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const ticketsStatesController = {
  findAll,
  findOne
};
