import { ForbiddenException, InternalServerErrorException, ITicketMessage, NotFoundException, UserType } from '@gsbelarus/util-api-types';
import { ticketsMessagesRepository } from '../repository';
import { ticketsRepository } from '@gdmn-nxt/modules/tickets/repository';

const findAll = async (
  sessionID: string,
  userId: number,
  ticketId: string,
  type?: UserType,
) => {
  try {
    const messages = await ticketsMessagesRepository.find(
      sessionID,
      {
        ...(ticketId && { USR$TICKETKEY: ticketId }),
      },
      undefined,
      type
    );

    return {
      messages: messages
    };
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createMessage = async (
  sessionID: string,
  userId: number,
  body: Omit<ITicketMessage, 'ID' | 'user'>,
  type: UserType,
  fromTicketEP?: boolean
) => {
  try {
    const oldTicket = await ticketsRepository.findOne(sessionID, { id: body.ticketKey }, type);

    if (oldTicket?.closeAt) {
      throw ForbiddenException('Тикет завершен');
    }

    if (!oldTicket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${body.ticketKey}`);
    }

    if (body.state && !fromTicketEP) {
      const ticket = await ticketsRepository.update(sessionID, oldTicket.ID, { ...oldTicket, state: body.state }, type);
    }

    const newMessage = await ticketsMessagesRepository.save(sessionID, { ...body, userId }, type);

    const message = await ticketsMessagesRepository.findOne(sessionID, { id: newMessage?.ID }, type);

    if (!message?.ID) {
      throw NotFoundException(`Не найдено сообщение с id=${newMessage?.ID}`);
    }

    return message;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsMessagesService = {
  findAll,
  createMessage
};
