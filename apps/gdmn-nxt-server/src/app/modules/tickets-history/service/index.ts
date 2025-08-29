import { InternalServerErrorException, ITicketHistory, NotFoundException, UserType } from '@gsbelarus/util-api-types';
import { ticketsHistoryRepository } from '../repository';
import { ticketsRepository } from '@gdmn-nxt/modules/tickets/repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any; },
) => {
  try {
    const {
      ticketId
    } = filter;

    const ticketsHistory = await ticketsHistoryRepository.find(
      sessionID,
      { USR$TICKETKEY: ticketId }
    );

    return {
      ticketsHistory: ticketsHistory
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  id: string
) => {
  try {
    const ticketHistory = await ticketsHistoryRepository.findOne(sessionID, { id });

    return ticketHistory;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createHistory = async (
  sessionID: string,
  userId: number,
  body: Omit<ITicketHistory, 'ID' | 'user'>,
  type: UserType,
) => {
  try {
    const oldTicket = await ticketsRepository.findOne(sessionID, { id: body.ticketKey }, type);

    if (!oldTicket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${body.ticketKey}`);
    }

    const newHistory = await ticketsHistoryRepository.save(sessionID, { ...body, userId }, type);

    const history = await ticketsHistoryRepository.findOne(sessionID, { id: newHistory?.ID }, type);

    if (!history?.ID) {
      throw NotFoundException(`Не найдена история с id=${newHistory?.ID}`);
    }

    return history;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsHistoryService = {
  findAll,
  findOne,
  createHistory
};
