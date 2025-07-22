import { IFilter, InternalServerErrorException, UserType, NotFoundException, IsNull, IsNotNull, ITicket } from '@gsbelarus/util-api-types';
import { ticketsRepository } from '../repository';
import { ERROR_MESSAGES } from '@gdmn/constants/server';
import { ticketsMessagesService } from '@gdmn-nxt/modules/tickets-messages/service';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any; },
  type?: UserType,
) => {
  try {
    const active = filter['active'] === 'true';

    const tickets = await ticketsRepository.find(
      sessionID,
      {
        USR$CLOSEAT: (active ? IsNull : IsNotNull)()
      },
      undefined,
      type
    );

    return {
      tickets: tickets
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const findOne = async (
  sessionID: string,
  id: string,
  type: UserType
) => {
  try {
    const ticket = await ticketsRepository.findOne(sessionID, { id }, type);

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createTicket = async (
  sessionID: string,
  userId: number,
  body: Omit<ITicket, 'ID'>,
  type: UserType
) => {
  try {
    const newTicket = await ticketsRepository.save(sessionID, { ...body, userId }, type);
    const ticket = await ticketsRepository.findOne(sessionID, { id: newTicket.ID }, type);

    const newMessage = await ticketsMessagesService.createMessage(
      sessionID,
      userId,
      {
        body: body.message,
        ticketKey: ticket.ID,
        state: ticket.state
      },
      type
    );

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  body: Omit<ITicket, 'ID'>,
  type: UserType
) => {
  try {
    const updatedTicket = await ticketsRepository.update(sessionID, id, body, type);
    if (!updatedTicket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${id}`);
    }
    const ticket = await ticketsRepository.findOne(sessionID, { id: updatedTicket.ID }, type);

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsService = {
  findAll,
  createTicket,
  updateById,
  findOne
};
