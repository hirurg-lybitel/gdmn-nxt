import { InternalServerErrorException, UserType, NotFoundException, ITicket, ForbiddenException, ticketStateCodes, ICRMTicketUser } from '@gsbelarus/util-api-types';
import { ticketsRepository } from '../repository';
import { ticketsMessagesService } from '@gdmn-nxt/modules/tickets-messages/service';
import { cachedRequets } from '@gdmn-nxt/server/utils/cachedRequests';
import { ticketsHistoryService } from '@gdmn-nxt/modules/tickets-history/service';
import { ticketsStateRepository } from '@gdmn-nxt/modules/tickets-state/repository';
import { IinsertNotificationParams, insertNotification } from '@gdmn-nxt/controllers/socket/notifications/insertNotification';
import { NotificationAction } from '@gdmn-nxt/socket';
import { sendEmail, SmtpOptions } from '@gdmn/mailer';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';
import { config } from '@gdmn-nxt/config';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any; },
  type?: UserType,
) => {
  try {
    const {
      active,
      companyKey,
      userId,
      state,
      performerKey,
      name,
      pageSize,
      pageNo,
      labels
    } = filter;

    const labelIds = labels?.split(',') ?? [];

    let fromRecord = 0;
    let toRecord: number;

    if (pageNo && pageSize) {
      fromRecord = Number(pageNo) * Number(pageSize);
      toRecord = fromRecord + Number(pageSize);
    };

    const result = await ticketsRepository.find(
      sessionID,
      {
        // ...(active ? { USR$CLOSEAT: (active === 'true' ? IsNull : IsNotNull)() } : {}),
        ...(companyKey ? { USR$COMPANYKEY: companyKey ?? -1 } : {}),
        ...(userId ? { USR$USERKEY: userId } : {}),
        ...(state ? { USR$STATE: state } : {}),
        ...(performerKey ? { USR$PERFORMERKEY: performerKey } : {})
      },
      undefined,
      type
    );

    const tickets = result.reduce<ITicket[]>((filteredArray, ticket) => {
      let checkConditions = true;

      if (name) {
        const lowerName = String(name).toLowerCase();
        checkConditions = checkConditions && ticket.title.toLowerCase().includes(lowerName);
      }

      if (labels) {
        checkConditions = checkConditions &&
          ticket.labels?.some(l => labelIds.includes(l.ID + ''));
      }

      if ('active' in filter) {
        const closed = (type !== UserType.Tickets && ticket.state.code === ticketStateCodes.done)
          || ticket.state.code === ticketStateCodes.confirmed;
        checkConditions = checkConditions && (active === 'true' ? !closed : closed);
      }

      if (checkConditions) {
        filteredArray.push({
          ...ticket
        });
      }
      return filteredArray;
    }, []);

    const usersWithPagination = tickets.slice(fromRecord, toRecord);
    const rowCount = tickets.length;

    const closed = result.filter(item => (type !== UserType.Tickets && item.state.code === ticketStateCodes.done)
      || item.state.code === ticketStateCodes.confirmed).length;

    return {
      tickets: usersWithPagination,
      count: rowCount,
      closed,
      open: result.length - closed
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
    if (!body.company.ID) {
      throw new Error('Не указана организация создателя тикета');
    }

    const newTicket = await ticketsRepository.save(sessionID, { ...body, userId }, type);
    const ticket = await ticketsRepository.findOne(sessionID, { ID: newTicket.ID }, type);

    if (!ticket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${newTicket.ID}`);
    }

    const newMessage = await ticketsMessagesService.createMessage(
      sessionID,
      userId,
      {
        body: body.message,
        ticketKey: ticket.ID,
        state: ticket?.state,
        sendAt: ticket.openAt,
        files: body.files
      },
      type,
      true,
    );

    const ticketStates = await ticketsStateRepository.find(sessionID);

    const initialState = ticketStates.find(state => state.code === ticketStateCodes.initial);

    await ticketsHistoryService.createHistory(
      sessionID,
      userId,
      {
        ticketKey: ticket.ID,
        state: initialState,
        changeAt: new Date()
      },
      type
    );

    const assignedState = ticketStates.find(state => state.code === ticketStateCodes.assigned);

    if (ticket.performer.ID && ticket.performer.ID !== -1) {
      await ticketsHistoryService.createHistory(
        sessionID,
        undefined,
        {
          ticketKey: ticket.ID,
          state: assignedState,
          changeAt: new Date(),
          performer: ticket.performer
        },
        type
      );
    }

    // Отправка уведомления усполнителю на почту и в систему при создании тикета
    if (ticket.performer.ID) {
      if (ticket.performer.email) {
        const { smtpHost, smtpPort, smtpUser, smtpPassword } = await systemSettingsRepository.findOne(sessionID);

        const smtpOpt: SmtpOptions = {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          password: smtpPassword
        };

        const messageText = `
          <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial">
            <div style="font-size:16px;margin-bottom:24px">Добрый день, <strong>${ticket.performer.fullName}</strong>!</div>
            <div style="font-size:20px;font-weight:bold;color:#1976d2">Создан новый тикет №${ticket.ID}</div>
            <div style="background:#f5f9ff;border:1px solid #e3f2fd;border-radius:8px;padding:16px;margin:16px 0">
              <div style="color:#666">${ticket.title}</div>
            </div>
            <div style="margin-top:24px;border-top:1px solid #eee;padding-top:16px">
              <a href="${config.origin}/employee/tickets/list/${ticket.ID}?disableSavedPath=true" style="color:#1976d2">Открыть в CRM</a>
              <p style="color:#999;font-size:12px">Это автоматическое уведомление. Пожалуйста, не отвечайте на него.</p>
            </div>
          </div>
        `;

        await sendEmail({
          from: 'Тикет система',
          to: ticket.performer.email,
          subject: 'Вам назначен новый тикет',
          html: messageText,
          options: { ...smtpOpt }
        });
      }

      await insertNotification({
        sessionId: sessionID,
        title: `Новый тикет №${ticket.ID}`,
        message: ticket.title.length > 60 ? ticket.title.slice(0, 60) + '...' : ticket.title,
        onDate: new Date(),
        userIDs: [ticket.performer.ID],
        actionContent: ticket.ID + '',
        actionType: NotificationAction.JumpToTicket
      });
    }

    cachedRequets.cacheRequest('customers');

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const updateById = async (
  sessionID: string,
  id: number,
  userId: number,
  body: Omit<ITicket, 'ID'>,
  type: UserType
) => {
  try {
    const oldTicket = await ticketsRepository.findOne(sessionID, { id }, type);

    const oldTicketIsOpen = oldTicket.state.code !== ticketStateCodes.done
      && oldTicket.state.code !== ticketStateCodes.confirmed;
    const newTicketIsOpen = body.state.code !== ticketStateCodes.done
      && body.state.code !== ticketStateCodes.confirmed;;

    if (oldTicket.state.code === ticketStateCodes.confirmed) {
      throw ForbiddenException('Тикет завершен');
    }

    const closeBy = (() => {
      if (oldTicketIsOpen) {
        if (!newTicketIsOpen) return userId;
        return undefined;
      }
      if (newTicketIsOpen) return undefined;
      return oldTicket?.closeBy?.ID;
    })();

    const closeAt = (() => {
      if (oldTicketIsOpen) {
        if (!newTicketIsOpen) return new Date();
        return undefined;
      }
      if (newTicketIsOpen) return undefined;
      return oldTicket.closeAt;
    })();

    const updatedTicket = await ticketsRepository.update(sessionID, id, { ...body, closeAt, closeBy: { ID: closeBy, fullName: '' } }, type);

    if (!updatedTicket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${id}`);
    }

    const ticket = await ticketsRepository.findOne(sessionID, { id: updatedTicket.ID }, type);

    const ticketStates = await ticketsStateRepository.find(sessionID);

    const assignedState = ticketStates.find(state => state.code === ticketStateCodes.assigned);

    const ressignedState = ticketStates.find(state => state.code === ticketStateCodes.ressigned);

    const doneState = ticketStates.find(state => state.code === ticketStateCodes.done);

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

        const link = `${config.origin}${type === UserType.Tickets ? '' : '/employee'}/tickets/list/${ticket.ID}?disableSavedPath=true`;
        const linkMessage = type === UserType.Tickets ? 'Открыть в системе заявок' : 'Открыть в CRM';

        const messageText = `
          <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial">
            <div style="font-size:16px;margin-bottom:24px">Добрый день, <strong>${user.fullName}</strong>!</div>
            <div style="font-size:20px;font-weight:bold;color:#1976d2">${title}</div>
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
          from: type === UserType.Tickets ? 'Система заявок' : 'Тикет система',
          to: user.email,
          subject: title,
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
        actionContent: ticket.ID + '',
        actionType: NotificationAction.JumpToTicket,
        ...rest,
      });
    };

    // При изменении состояния тикета
    if (body.state.ID && oldTicket.state.ID !== body.state.ID) {
      // Тикет завершен клиентом до состояния "Закрыт"
      if (body.state.code === ticketStateCodes.confirmed && oldTicket.state.code !== ticketStateCodes.done) {
        await ticketsHistoryService.createHistory(
          sessionID,
          userId,
          {
            ticketKey: oldTicket.ID,
            state: doneState,
            changeAt: new Date(),
          },
          type
        );
        await ticketsHistoryService.createHistory(
          sessionID,
          userId,
          {
            ticketKey: oldTicket.ID,
            state: body.state,
            changeAt: new Date(),
            performer: body.performer
          },
          type
        );
        await sendNotification({
          title: `Тикет №${ticket.ID} завершен`,
          message: 'Клиент завершил тикет',
          user: ticket.performer,
        });
      } else {
        // Сохранение в историю изменения состояния тикета
        await ticketsHistoryService.createHistory(
          sessionID,
          userId,
          {
            ticketKey: oldTicket.ID,
            state: body.state,
            changeAt: new Date(),
            performer: body.performer
          },
          type
        );
        // Отправка уведомления исполнителю после подверждения тикета со стадии "Завершен"
        if (body.state.code === ticketStateCodes.confirmed) {
          await sendNotification({
            title: `Тикет №${ticket.ID} завершен`,
            message: 'Клиент подтвердил выполнение тикета',
            user: ticket.performer,
          });
        } else {
          // Отправка уведомления об изменении состояния тикета исполнителю
          if (userId !== ticket.performer.ID) {
            if (type === UserType.Tickets && body.state.code === ticketStateCodes.inProgress) {
              await sendNotification({
                title: `Тикет №${ticket.ID}`,
                message: 'Выполнение тикета было отклонено клиентом',
                user: ticket.performer,
              });
            } else {
              await sendNotification({
                title: `Тикет №${ticket.ID}`,
                message: `Статус тикета изменен на "${body.state.name}"`,
                user: ticket.performer,
              });
            }
          }
          // Отправка уведомления об изменении состояния тикета клиенту
          if (ticket.sender.ID !== userId) {
            if (body.state.code === ticketStateCodes.done) {
              await sendNotification({
                title: `Заявка №${ticket.ID}`,
                message: 'Заявка была отмечена как завершённая сотрудником технической поддержки. Просим подтвердить выполнение. Если у вас остались вопросы или проблема не решена — вы можете возобновить заявку.',
                user: ticket.sender,
                type: UserType.Tickets
              });
            } else {
              await sendNotification({
                title: `Заявка №${ticket.ID}`,
                message: `Статус заявки изменен на "${body.state.name}"`,
                user: ticket.sender,
                type: UserType.Tickets
              });
            }
          }
        }
      }
    }

    // При изменении исполнителя
    if ((!oldTicket.performer.ID || oldTicket.performer.ID !== body.performer.ID) && body.performer.ID) {
      if (!oldTicket.performer.ID) {
        await ticketsHistoryService.createHistory(
          sessionID,
          userId,
          {
            ticketKey: ticket.ID,
            state: assignedState,
            changeAt: new Date(),
            performer: body.performer
          },
          type
        );
      } else {
        await ticketsHistoryService.createHistory(
          sessionID,
          userId,
          {
            ticketKey: ticket.ID,
            state: ressignedState,
            changeAt: new Date(),
            performer: body.performer
          },
          type
        );
      }
      if (ticket.performer.ID !== userId) {
        await sendNotification({
          title: 'Вам назначен новый тикет',
          message: ticket.title.length > 60 ? ticket.title.slice(0, 60) + '...' : ticket.title,
          user: ticket.performer,
        });
      }
    }

    const newLabels = !body.labels ? [] : body.labels.filter(label2 =>
      !(oldTicket.labels ?? []).some(label1 => label1.ID === label2.ID)
    );

    const removedLabels = !oldTicket.labels ? [] : oldTicket.labels.filter(label1 =>
      !(body.labels ?? []).some(label2 => label2.ID === label1.ID)
    );

    if ([...newLabels, ...removedLabels].length > 0) {
      await ticketsHistoryService.createHistory(
        sessionID,
        userId,
        {
          ticketKey: ticket.ID,
          changeAt: new Date(),
          addedLabels: newLabels,
          removedLabels: removedLabels
        },
        type
      );
    }

    if (oldTicket.closeAt !== ticket.closeAt) cachedRequets.cacheRequest('customers');

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
