import { InternalServerErrorException, ITicketHistory, NotFoundException, UserType } from '@gsbelarus/util-api-types';
import { ticketsHistoryRepository } from '../repository';
import { ticketsRepository } from '@gdmn-nxt/modules/tickets/repository';
import { ticketsService } from '@gdmn-nxt/modules/tickets/service';

const findAll = async (
  sessionID: string,
  type: UserType,
  userId: number,
  isAdmin: boolean,
  companyKey: number,
  showAll: boolean,
  filter?: { [key: string]: any; }
) => {
  try {
    const {
      ticketId
    } = filter;

    const ticket = await ticketsService.findOne(sessionID, ticketId, type, userId, isAdmin, companyKey, showAll);

    if (!ticket?.ID) {
      throw NotFoundException(`Не найдет тикет с id=${ticketId}`);
    }

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
