import { ForbiddenException, InternalServerErrorException, ITicketMessage, NotFoundException, UserType } from '@gsbelarus/util-api-types';
import { ticketsMessagesRepository } from '../repository';
import { ticketsRepository } from '@gdmn-nxt/modules/tickets/repository';
import { buckets, minioClient } from '@gdmn-nxt/lib/minio';
import { ticketsHistoryService } from '@gdmn-nxt/modules/tickets-history/service';

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
      await ticketsHistoryService.createHistory(
        sessionID,
        undefined,
        {
          ticketKey: oldTicket.ID,
          state: body.state,
          changeAt: new Date()
        },
        type
      );
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

const updateById = async (
  sessionID: string,
  id: number,
  userId: number,
  body: Omit<ITicketMessage, 'ID'>,
  type: UserType
) => {
  try {
    if (userId !== body.user.ID) {
      throw ForbiddenException('У вас недостаточно прав');
    }

    const updatedMessage = await ticketsMessagesRepository.update(sessionID, id, body, type);
    if (!updatedMessage?.ID) {
      throw NotFoundException(`Не найдено сообщение с id=${id}`);
    }

    const message = await ticketsMessagesRepository.findOne(sessionID, { id: updatedMessage.ID }, type);

    return message;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const removeById = async (
  sessionID: string,
  id: number,
  userId: number,
  type: UserType
) => {
  try {
    const oldMessage = await ticketsMessagesRepository.findOne(sessionID, { ID: id }, type);

    if (!oldMessage?.ID) {
      throw NotFoundException(`Не найдено сообщение с id=${id}`);
    }

    if (userId !== oldMessage.user.ID) {
      throw ForbiddenException('У вас недостаточно прав');
    }

    if (minioClient) {
      await Promise.all(oldMessage.files.map(async (file) => {
        return await minioClient?.removeObject(buckets.ticketMessages, file.fileName);
      }));
    } else {
      console.error('minioClient не определен');
    }

    return await ticketsMessagesRepository.remove(sessionID, id, type);
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

export const ticketsMessagesService = {
  findAll,
  createMessage,
  updateById,
  removeById
};
