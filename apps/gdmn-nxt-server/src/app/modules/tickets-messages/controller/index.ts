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

    const ticketsUser = req.user['ticketsUser'];

    const response = await ticketsMessagesService.findAll(
      sessionID,
      userId,
      ticketId,
      ticketsUser ? UserType.Tickets : UserType.CRM,
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
    const messages = await ticketsMessagesService.createMessage(req.sessionID, userId, req.body, req.user['ticketsUser'] ? UserType.Tickets : UserType.CRM);

    const result: IRequestResult = {
      queries: { messages: [messages] },
      _schema: {}
    };

    return res.status(200).json(result);
  } catch (error) {
    res.status(error.code ?? 500).send(resultError(error.message));
  }
};

export const ticketsMessagesController = {
  findAll,
  createMessage
};
