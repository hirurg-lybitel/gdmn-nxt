import { ticketsService } from './../service/index';
import { RequestHandler } from 'express';
import { ForbiddenException, IRequestResult, UserType } from '@gsbelarus/util-api-types';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const type = req.user['type'];
    const isAdmin = req.user['isAdmin'];
    const userId = req.user['id'] ?? -1;

    const response = await ticketsService.findAll(
      sessionID,
      {
        ...req.query,
        ...(type === UserType.Tickets ? { conpanyKey: req.user['companyKey'] ?? -1 } : {}),
        ...((type === UserType.Tickets && !isAdmin) ? { userId } : {})
      },
      type
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

const findOne: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await ticketsService.findOne(req.sessionID, id, req.user['type']);
    return res.status(200).json(ticket);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const createTicket: RequestHandler = async (req, res) => {
  try {
    const userId = req.user['id'];

    const type = req.user['type'];

    if (type === UserType.Tickets && req.body.company.ID !== req.user['companyKey']) {
      throw ForbiddenException('Организация создаваемого тикета отличается от вашей');
    }

    const tickets = await ticketsService.createTicket(req.sessionID, userId, req.body, req.user['type']);

    const result: IRequestResult = {
      queries: { tickets: [tickets] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const updateById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  try {
    const updatedTicket = await ticketsService.updateById(
      req.sessionID,
      id,
      req.body,
      req.user['type']
    );

    const result: IRequestResult = {
      queries: { tickets: [updatedTicket] },
      _params: [{ id }],
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const ticketsController = {
  findAll,
  createTicket,
  updateById,
  findOne
};
