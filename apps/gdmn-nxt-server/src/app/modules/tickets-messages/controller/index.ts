import { RequestHandler } from 'express';
import { IRequestResult, UserType } from '@gsbelarus/util-api-types';
import { ticketsMessagesService } from '../service';
import { resultError } from '@gsbelarus/util-helpers';

const findAll: RequestHandler = async (req, res) => {
  try {
    const { id: sessionID } = req.session;

    const ticketId = req.params.ticketId;

    const userId = req.user['id'];

    if (!ticketId) {
      throw new Error('Не указан обязательный параметр ticketId');
    }

    const response = await ticketsMessagesService.findAll(
      sessionID,
      userId,
      ticketId,
      req.user['type'],
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
    const messages = await ticketsMessagesService.createMessage(req.sessionID, userId, req.body, req.user['type']);

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
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
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
    return res
      .status(422)
      .send(resultError('Field ID is not defined or is not numeric'));
  }

  const userId = req.user['id'];


  try {
    await ticketsMessagesService.removeById(req.sessionID, id, userId, req.user['type']);
    res.sendStatus(200);
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
