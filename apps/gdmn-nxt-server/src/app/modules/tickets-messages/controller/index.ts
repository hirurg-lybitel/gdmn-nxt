import { RequestHandler } from 'express';
import { IRequestResult } from '@gsbelarus/util-api-types';
import { ticketsMessagesService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const ticketId = parseInt(req.params.ticketId);

    if (isNaN(ticketId)) {
      throw new Error('Идентификатор поля не определен или не является числовым');
    }

    const response = await ticketsMessagesService.findAll(
      sessionID,
      ticketId,
      req.user['type'],
      req.user['id'],
      req.user['isAdmin'],
      req.user['companyKey'],
      !!req.user['permissions']?.['ticketSystem/tickets/all']?.GET
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

const createMessage: RequestHandler = async (req, res) => {
  try {
    const userId = req.user['id'];
    const messages = await ticketsMessagesService.createMessage(
      req.sessionID,
      userId,
      req.body,
      req.user['type'],
      req.user['isAdmin'],
      req.user['companyKey'],
      !!req.user['permissions']?.['ticketSystem/tickets/all']?.GET
    );

    const result: IRequestResult = {
      queries: { messages: [messages] },
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
    throw new Error('Идентификатор поля не определен или не является числовым');
  }

  const userId = req.user['id'];

  try {
    const updatedMessage = await ticketsMessagesService.updateById(
      req.sessionID,
      id,
      userId,
      req.body,
      req.user['type']
    );

    const result: IRequestResult = {
      queries: { messages: [updatedMessage] },
      _params: [{ id }],
      _schema: {}
    };
    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

const removeById: RequestHandler = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    throw new Error('Идентификатор поля не определен или не является числовым');
  }

  const userId = req.user['id'];


  try {
    const resp = await ticketsMessagesService.removeById(req.sessionID, id, userId, req.user['type']);

    res.status(200).json(resp);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const ticketsMessagesController = {
  findAll,
  createMessage,
  updateById,
  removeById
};
