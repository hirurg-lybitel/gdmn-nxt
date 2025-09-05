import { ForbiddenException, ICRMTicketUser, InternalServerErrorException, ITicketMessage, NotFoundException, ticketStateCodes, UserType } from '@gsbelarus/util-api-types';
import { ticketsMessagesRepository } from '../repository';
import { ticketsRepository } from '@gdmn-nxt/modules/tickets/repository';
import { buckets, minioClient } from '@gdmn-nxt/lib/minio';
import { ticketsHistoryService } from '@gdmn-nxt/modules/tickets-history/service';
import { IinsertNotificationParams, insertNotification } from '@gdmn-nxt/controllers/socket/notifications/insertNotification';
import { NotificationAction } from '@gdmn-nxt/socket';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';
import { sendEmail, SmtpOptions } from '@gdmn/mailer';
import { config } from '@gdmn-nxt/config';

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

    if (oldTicket.state.code === ticketStateCodes.confirmed) {
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

    const newUserMessage = await ticketsMessagesRepository.findOne(sessionID, { id: newMessage?.ID }, type);

    if (!newUserMessage?.ID) {
      throw NotFoundException(`Не найдено сообщение с id=${newMessage?.ID}`);
    }

    interface ISendNotification extends Omit<IinsertNotificationParams, 'userIDs' | 'sessionId'> {
      user: ICRMTicketUser;
    }

    const sendNotification = async (params: ISendNotification) => {
      const { user, title, message, type = UserType.Gedemin, ...rest } = params;
      if (user.email) {
        const { smtpHost, smtpPort, smtpUser, smtpPassword } = await systemSettingsRepository.findOne(sessionID);

        const smtpOpt: SmtpOptions = {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          password: smtpPassword
        };

        const link = `${config.origin}${type === UserType.Tickets ? '' : '/employee'}/tickets/list/${oldTicket.ID}?disableSavedPath=true`;
        const linkMessage = type === UserType.Tickets ? 'Открыть в системе заявок' : 'Открыть в CRM';
        const mailTitle = `Новое сообщение от ${newUserMessage.user.fullName} в ${type === UserType.Tickets ? 'заявке' : 'тикете'} №${oldTicket.ID}`;

        const messageText = `
          <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial">
            <div style="font-size:16px;margin-bottom:24px">Добрый день, <strong>${user.fullName}</strong>!</div>
            <div style="font-size:20px;font-weight:bold;color:#1976d2">${mailTitle}</div>
            <div style="background:#f5f9ff;border:1px solid #e3f2fd;border-radius:8px;padding:16px;margin:16px 0">
              <div style="color:#666">${message}</div>
            </div>
            <div style="margin-top:24px;border-top:1px solid #eee;padding-top:16px">
              <a href="${link}" style="color:#1976d2">${linkMessage}</a>
              <p style="color:#999;font-size:12px">Это автоматическое уведомление. Пожалуйста, не отвечайте на него.</p>
            </div>
          </div>
        `;

        await sendEmail({
          from: newUserMessage.user.fullName,
          to: user.email,
          subject: 'Новое сообщение',
          html: messageText,
          options: { ...smtpOpt }
        });
      }

      return await insertNotification({
        title: title,
        message: message,
        type: type,
        sessionId: sessionID,
        onDate: new Date(),
        userIDs: [user.ID],
        actionContent: oldTicket.ID + '',
        actionType: NotificationAction.JumpToTicket,
        ...rest,
      });
    };

    if (type === UserType.Tickets && oldTicket.performer.ID && !fromTicketEP) {
      await sendNotification({
        title: `Тикет №${oldTicket.ID}`,
        message: body.body.length > 60 ? body.body.slice(0, 60) + '...' : body.body,
        onDate: body.sendAt ? new Date(body.sendAt) : new Date(),
        user: oldTicket.performer,
      });
    }
    if (type !== UserType.Tickets && oldTicket.sender.ID) {
      await sendNotification({
        title: `Заявка №${oldTicket.ID}`,
        message: body.body.length > 60 ? body.body.slice(0, 60) + '...' : body.body,
        onDate: body.sendAt ? new Date(body.sendAt) : new Date(),
        user: oldTicket.sender,
        type: UserType.Tickets,
      });
    }

    return newUserMessage;
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
