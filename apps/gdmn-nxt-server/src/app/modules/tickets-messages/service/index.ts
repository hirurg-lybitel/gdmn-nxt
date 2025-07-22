import { InternalServerErrorException, ITicketMessage, UserType } from '@gsbelarus/util-api-types';
import { ticketsMessagesRepository } from '../repository';

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
  type: UserType
) => {
  try {
    const newMessage = await ticketsMessagesRepository.save(sessionID, { ...body, userId }, type);
    const message = await ticketsMessagesRepository.findOne(sessionID, { id: newMessage.ID }, type);

    return message;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsMessagesService = {
  findAll,
  createMessage
};
