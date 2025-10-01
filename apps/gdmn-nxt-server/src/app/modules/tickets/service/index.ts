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
import { PermissionsController } from '@gdmn-nxt/controllers/permissions';
import { profileSettingsController } from '@gdmn-nxt/controllers/settings/profileSettings';
import { ticketsUserRepository } from '@gdmn-nxt/modules/tickets-user/repository';

const findAll = async (
  sessionID: string,
  filter?: { [key: string]: any; },
  type?: UserType,

) => {
  try {
    const {
      active,
      companyKey,
      companyID,
      userId,
      state,
      performerKey,
      name,
      pageSize,
      pageNo,
      labels,
      sender,
      date
    } = filter;

    const openCloseDate = date ? new Date(Number(date)) : undefined;

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
        ...(userId ? { $OR: [{ USR$USERKEY: userId, USR$PERFORMERKEY: userId, USR$CRM_USERKEY: userId }] } : {}),
        ...(companyID ? { USR$COMPANYKEY: companyID } : {})
      }
    );

    const tickets = result.reduce<ITicket[]>((filteredArray, ticket) => {
      let checkConditions = true;

      if (openCloseDate) {
        checkConditions = checkConditions &&
          (
            ticket.closeAt?.toDateString() === openCloseDate.toDateString()
            || ticket.openAt?.toDateString() === openCloseDate.toDateString()
          );
      }

      if (name) {
        const lowerName = String(name).toLowerCase();
        checkConditions = checkConditions && ticket.title.toLowerCase().includes(lowerName);
      }

      if (labels) {
        checkConditions = checkConditions &&
          ticket.labels?.some(l => labelIds.includes(l.ID + ''));
      }

      if (performerKey) {
        checkConditions = checkConditions &&
          ticket.performers?.some(performer => performer.ID === Number(performerKey));
      }

      if (state) {
        checkConditions = checkConditions &&
          ticket.state.ID === Number(state);
      }

      if (companyKey) {
        checkConditions = checkConditions &&
          ticket.company.ID === Number(companyKey);
      }

      if (sender) {
        checkConditions = checkConditions &&
          ticket.sender.ID === Number(sender);
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
  id: number,
  type: UserType,
  userId: number,
  isAdmin: boolean,
  companyKey: number,
  showAll: boolean
) => {
  try {
    const ticket = await ticketsRepository.findOne(sessionID, { id });

    if (type === UserType.Tickets) {
      if (isAdmin && companyKey === ticket.company.ID) return ticket;
      if (userId === ticket.sender.ID) return ticket;
      throw ForbiddenException('У вас недостаточно прав');
    }

    if (!showAll && userId !== ticket.sender?.ID && !ticket.performers?.some(performer => performer.ID === Number(userId))) {
      throw ForbiddenException('У вас недостаточно прав');
    }

    return ticket;
  } catch (error) {
    throw InternalServerErrorException(error.message);
  }
};

const createTicket = async (
  sessionID: string,
  userId: number,
  body: Omit<ITicket, 'ID'>,
  type: UserType,
  isAdmin: boolean,
  companyKey: number
) => {
  try {
    if (!body.company.ID) {
      throw new Error('Не указана организация создателя тикета');
    }

    const responceTicket = await ticketsRepository.save(sessionID, { ...body, userId }, type);
    const ticket = await ticketsRepository.findOne(sessionID, { ID: responceTicket.ID }, type);

    if (!ticket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${responceTicket.ID}`);
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
      isAdmin,
      companyKey,
      true,
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

    if (ticket.performers && ticket.performers.length > 0) {
      await Promise.all(ticket.performers.map(async (performer) => {
        await ticketsHistoryService.createHistory(
          sessionID,
          type === UserType.Tickets ? undefined : userId,
          {
            ticketKey: ticket.ID,
            state: assignedState,
            changeAt: new Date(),
            performer: performer
          },
          type
        );
      }));
    }

    const { smtpHost, smtpPort, smtpUser, smtpPassword, performersGroup, OURCOMPANY: { NAME: ourCompanyName, ID: ourCompanyId } } = await systemSettingsRepository.findOne(sessionID);

    const sendNewTicketNotification = async (params: { user: ICRMTicketUser, allUsers?: boolean; }) => {
      const { user, allUsers = false } = params;
      const type = user.type || UserType.Gedemin;
      const userSettings = await profileSettingsController.getSettings({ userId: user.ID, sessionId: sessionID, type });

      if (user.email && userSettings.settings.TICKETS_EMAIL && (allUsers || userSettings.settings.ALL_TICKET_EMAIL_NOTIFICATIONS)) {
        try {
          const { smtpHost, smtpPort, smtpUser, smtpPassword, OURCOMPANY: { NAME: ourCompanyName } } = await systemSettingsRepository.findOne(sessionID);

          const smtpOpt: SmtpOptions = {
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            password: smtpPassword
          };

          const link = `${config.fullOrigin}${type === UserType.Tickets ? '' : '/employee'}/tickets/list/${ticket.ID}?disableSavedPath=true`;
          const linkMessage = type === UserType.Tickets ? 'Открыть в системе заявок' : 'Открыть в CRM';

          const messageText = `
             <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial">
               <div style="font-size:16px;margin-bottom:24px">Добрый день, <strong>${user.fullName}</strong>!</div>
               <div style="font-size:20px;font-weight:bold;color:#1976d2">Создан новый тикет №${ticket.ID}</div>
               <div style="background:#f5f9ff;border:1px solid #e3f2fd;border-radius:8px;padding:16px;margin:16px 0">
                 <div style="color:#666">Тема: ${ticket.title}</div>
                 <div style="color:#666">Постановщик: ${ticket.sender.fullName}</div>
               </div>
               <div style="margin-top:24px;border-top:1px solid #eee;padding-top:16px">
                 <a href="${link}" style="color:#1976d2">${linkMessage}</a>
                 <p style="color:#999;font-size:12px">Это автоматическое уведомление. Пожалуйста, не отвечайте на него.</p>
               </div>
             </div>
           `;

          await sendEmail({
            from: `${type === UserType.Tickets ? 'Система заявок' : 'Тикет система'} ${ourCompanyName} <${smtpUser}>`,
            to: user.email,
            subject: `Новый тикет №${ticket.ID}`,
            html: messageText,
            options: { ...smtpOpt }
          });
        } catch (error) {
          console.log('updateTicket_sendMail_Error', error);
        }
      }

      await insertNotification({
        sessionId: sessionID,
        title: `Новый тикет №${ticket.ID}`,
        message: `${ticket.title.length > 60 ? ticket.title.slice(0, 60) + '...' : ticket.title}
        Постановщик: ${ticket.sender.fullName}`,
        onDate: new Date(),
        userIDs: [user.ID],
        actionContent: ticket.ID + '',
        actionType: NotificationAction.JumpToTicket,
        type
      });
    };

    const [CRMAdmins, customerAdmins]: ICRMTicketUser[][] = await (async () => {
      const CRMAdmins = (!performersGroup?.ID ? [] : await PermissionsController.getUserGroupLine(sessionID, performersGroup.ID)).map((user) => {
        return {
          ID: user.USER.ID,
          fullName: user.USER.CONTACT.NAME,
          email: user.USER.EMAIL,
          type: UserType.Gedemin
        };
      });

      const customerAdmins = ticket.company.ID === ourCompanyId ? [] : (await ticketsUserRepository.find(
        sessionID,
        {
          USR$COMPANYKEY: Number(companyKey),
          USR$ISADMIN: 1,
        },
        undefined,
        UserType.Gedemin
      )).map((user) => {
        return {
          ID: user.ID,
          fullName: user.fullName,
          email: user.email,
          type: UserType.Tickets
        };
      });

      return [CRMAdmins, customerAdmins];
    })();

    // Отправка уведомления исполнителям на почту и в систему при создании тикета
    if (ticket.performers && ticket.performers.length > 0) {
      await Promise.all(ticket.performers.map(async (performer) => {
        if (performer?.ID !== userId) {
          try {
            const userSettings = await profileSettingsController.getSettings({ userId: performer.ID, sessionId: sessionID, type: UserType.Gedemin });
            if (performer.email && userSettings.settings.TICKETS_EMAIL) {
              const smtpOpt: SmtpOptions = {
                host: smtpHost,
                port: smtpPort,
                user: smtpUser,
                password: smtpPassword
              };

              const messageText = `
                <div style="max-width:600px;margin:0 auto;padding:20px;font-family:Arial">
                  <div style="font-size:16px;margin-bottom:24px">Добрый день, <strong>${performer.fullName}</strong>!</div>
                  <div style="font-size:20px;font-weight:bold;color:#1976d2">Вам назначен новый тикет №${ticket.ID}</div>
                  <div style="background:#f5f9ff;border:1px solid #e3f2fd;border-radius:8px;padding:16px;margin:16px 0">
                    <div style="color:#666">${ticket.title}</div>
                  </div>
                  <div style="margin-top:24px;border-top:1px solid #eee;padding-top:16px">
                    <a href="${config.fullOrigin}/employee/tickets/list/${ticket.ID}?disableSavedPath=true" style="color:#1976d2">Открыть в CRM</a>
                    <p style="color:#999;font-size:12px">Это автоматическое уведомление. Пожалуйста, не отвечайте на него.</p>
                  </div>
                </div>
              `;

              await sendEmail({
                from: `Тикет система ${ourCompanyName} <${smtpUser}>`,
                to: performer.email,
                subject: 'Вам назначен новый тикет',
                html: messageText,
                options: { ...smtpOpt }
              });
            }
          } catch (error) {
            console.log('createTicket_sendMail_Error', error);
          }

          await insertNotification({
            sessionId: sessionID,
            title: `Новый тикет №${ticket.ID}`,
            message: ticket.title.length > 60 ? ticket.title.slice(0, 60) + '...' : ticket.title,
            onDate: new Date(),
            userIDs: [performer.ID],
            actionContent: ticket.ID + '',
            actionType: NotificationAction.JumpToTicket
          });
        }
      }));

      // Отправка уведомления админам которые хотят видеть уведомления о всех тикетах
      await Promise.all([...CRMAdmins, ...customerAdmins].map(async (user) => {
        if (user.ID === userId || ticket.performers.some(performer => performer.ID === user.ID)) return;
        return await sendNewTicketNotification({
          user,
          allUsers: false
        });
      }));
    } else {
      // Если не указан исполнитель отправка уведомления всем админам
      await Promise.all(CRMAdmins.map(async (user) => {
        if (user.ID === userId) return;
        return await sendNewTicketNotification({
          user,
          allUsers: true
        });
      }));
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
  type: UserType,
  isAdmin: boolean,
  companyKey: number,
  showAll: boolean
) => {
  try {
    const oldTicket = await findOne(sessionID, id, type, userId, isAdmin, companyKey, showAll);

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

    const updatedTicket = await ticketsRepository.update(
      sessionID,
      id,
      {
        ...body,
        closeAt,
        closeBy: { ID: closeBy, fullName: '' }
      },
      type);

    if (!updatedTicket?.ID) {
      throw NotFoundException(`Не найден тикет с id=${id}`);
    }

    const ticket = await ticketsRepository.findOne(sessionID, { id: updatedTicket.ID }, type);

    const ticketStates = await ticketsStateRepository.find(sessionID);

    const assignedState = ticketStates.find(state => state.code === ticketStateCodes.assigned);

    const doneState = ticketStates.find(state => state.code === ticketStateCodes.done);

    interface ISendNotification extends Omit<IinsertNotificationParams, 'userIDs' | 'sessionId'> {
      user: ICRMTicketUser;
      notificationMessage?: string;
      notificationTitle?: string;
      checkMonitorAllTickets?: boolean;
    }

    const { smtpHost, smtpPort, smtpUser, smtpPassword, performersGroup, OURCOMPANY: { NAME: ourCompanyName, ID: ourCompanyId } } = await systemSettingsRepository.findOne(sessionID);

    const sendNotification = async (params: ISendNotification) => {
      const { user, title, message, type = UserType.Gedemin, notificationMessage, notificationTitle, checkMonitorAllTickets, ...rest } = params;
      const userSettings = await profileSettingsController.getSettings({ userId: user.ID, sessionId: sessionID, type });

      if (user.email && userSettings.settings.TICKETS_EMAIL && (!checkMonitorAllTickets || userSettings.settings.ALL_TICKET_EMAIL_NOTIFICATIONS)) {
        try {
          const smtpOpt: SmtpOptions = {
            host: smtpHost,
            port: smtpPort,
            user: smtpUser,
            password: smtpPassword
          };

          const link = `${config.fullOrigin}${type === UserType.Tickets ? '' : '/employee'}/tickets/list/${ticket.ID}?disableSavedPath=true`;
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
            from: `${type === UserType.Tickets ? 'Система заявок' : 'Тикет система'} ${ourCompanyName} <${smtpUser}>`,
            to: user.email,
            subject: title,
            html: messageText,
            options: { ...smtpOpt }
          });
        } catch (error) {
          console.log('updateTicket_sendMail_Error', error);
        }
      }

      return await insertNotification({
        title: notificationTitle ?? title,
        message: notificationMessage ?? message,
        type: type,
        sessionId: sessionID,
        onDate: new Date(),
        userIDs: [user.ID],
        actionContent: ticket.ID + '',
        actionType: NotificationAction.JumpToTicket,
        ...rest,
      });
    };

    const sendNotificationToPerformers = async (params: Omit<ISendNotification, 'user'>) => {
      if (ticket?.performers && ticket.performers.length > 0) {
        await Promise.all(ticket.performers.map(async (performer) => {
          if (performer.ID === userId) return;
          await sendNotification({
            ...params,
            user: performer,
          });
        }));
      }
    };

    const [CRMAdmins, customerAdmins]: ICRMTicketUser[][] = await (async () => {
      const CRMAdmins = (!performersGroup?.ID ? [] : await PermissionsController.getUserGroupLine(sessionID, performersGroup.ID)).map((user) => {
        return {
          ID: user.USER.ID,
          fullName: user.USER.CONTACT.NAME,
          email: user.USER.EMAIL,
          type: UserType.Gedemin
        };
      });

      const customerAdmins = ticket.company.ID === ourCompanyId ? [] : (await ticketsUserRepository.find(
        sessionID,
        {
          USR$COMPANYKEY: Number(companyKey),
          USR$ISADMIN: 1,
        },
        undefined,
        UserType.Gedemin
      )).map((user) => {
        return {
          ID: user.ID,
          fullName: user.fullName,
          email: user.email,
          type: UserType.Tickets
        };
      });

      return [CRMAdmins, customerAdmins];
    })();

    const sendToAdmins = async ({ adminType, ...params }: Omit<ISendNotification, 'user'> & { adminType: 'gedemin' | 'tickets' | 'all'; }) => {
      const admins = (() => {
        switch (adminType) {
          case 'gedemin': return CRMAdmins;
          case 'tickets': return customerAdmins;
          default: return [...CRMAdmins, ...customerAdmins];
        }
      })();
      await Promise.all(admins.map(async (user) => {
        if (ticket.performers.some(performer => performer.ID === user.ID)) return;
        await sendNotification({
          ...params,
          user,
          type: user.type
        });
      }));
    };

    // При изменении состояния тикета
    if (body.state.ID && oldTicket.state.ID !== body.state.ID) {
      // Тикет завершен постановщиком до состояния "Закрыт"
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
            changeAt: new Date()
          },
          type
        );
        await sendNotificationToPerformers({
          title: `Тикет №${ticket.ID} завершен`,
          message: 'Постановщик завершил тикет'
        });
        await sendToAdmins({
          title: `Тикет №${ticket.ID} завершен`,
          message: 'Постановщик завершил тикет',
          checkMonitorAllTickets: true,
          adminType: 'all'
        });
      } else {
        // Сохранение в историю изменения состояния тикета
        await ticketsHistoryService.createHistory(
          sessionID,
          userId,
          {
            ticketKey: oldTicket.ID,
            state: body.state,
            changeAt: new Date()
          },
          type
        );
        // Отправка уведомления исполнителям после подверждения тикета со стадии "Завершен"
        if (body.state.code === ticketStateCodes.confirmed) {
          await sendNotificationToPerformers({
            title: `Тикет №${ticket.ID} завершен`,
            message: 'Постановщик подтвердил выполнение тикета'
          });
          await sendToAdmins({
            title: `Тикет №${ticket.ID} завершен`,
            message: 'Постановщик подтвердил выполнение тикета',
            checkMonitorAllTickets: true,
            adminType: 'all'
          });
        } else {
          // Отправка уведомления об изменении состояния тикета исполнителям
          if (oldTicket.state.code === ticketStateCodes.done && body.state.code === ticketStateCodes.inProgress) {
            await sendNotificationToPerformers({
              title: `Тикет №${ticket.ID}`,
              message: 'Выполнение тикета было отклонено постановщиком',
            });
          } else {
            await sendNotificationToPerformers({
              title: `Тикет №${ticket.ID}`,
              message: `Статус тикета изменен на "${body.state.name}"`,
            });
          }
          // Отправка уведомления об изменении состояния тикета постановщику
          if (ticket.sender.ID !== userId) {
            if (body.state.code === ticketStateCodes.done) {
              await sendNotification({
                title: `Заявка №${ticket.ID}`,
                message: 'Заявка была отмечена как завершённая сотрудником технической поддержки. Просим подтвердить выполнение. Если у вас остались вопросы или проблема не решена — вы можете возобновить заявку.',
                user: ticket.sender,
                type: ticket.sender.type
              });
            } else {
              await sendNotification({
                title: `Заявка №${ticket.ID}`,
                message: `Статус заявки изменен на "${body.state.name}"`,
                user: ticket.sender,
                type: ticket.sender.type
              });
            }
          }
        }
      }
    }

    const addedPerformers = !body.performers ? [] : body.performers.filter(newPerformer =>
      !(oldTicket.performers ?? []).some(oldPerformer => oldPerformer.ID === newPerformer.ID)
    );

    const removedPerformers = !oldTicket.performers ? [] : oldTicket.performers.filter(oldPerformer =>
      !(body.performers ?? []).some(newPerformer => newPerformer.ID === oldPerformer.ID)
    );

    // Добавление в историю изменения исполнителей
    if (addedPerformers.length > 0 || removedPerformers.length > 0) {
      await ticketsHistoryService.createHistory(
        sessionID,
        userId,
        {
          ticketKey: ticket.ID,
          state: assignedState,
          changeAt: new Date(),
          addedPerformers,
          removedPerformers
        },
        type
      );
    }

    // Отправка новым исполнителям уведомления
    if (addedPerformers.length > 0) {
      await Promise.all(addedPerformers.map(async (performer) => {
        await sendNotification({
          title: 'Вам назначен новый тикет',
          message: ticket.title.length > 60 ? ticket.title.slice(0, 60) + '...' : ticket.title,
          user: performer,
        });
      }));
    }

    // Запись с историю и отправка уведомления при запросе\подверждения состоящегося звонка
    if (oldTicket.needCall !== ticket.needCall) {
      await ticketsHistoryService.createHistory(
        sessionID,
        userId,
        {
          ticketKey: ticket.ID,
          needCall: ticket.needCall,
          changeAt: new Date()
        },
        type
      );
      if (ticket.needCall) {
        await sendNotificationToPerformers({
          title: `${ticket.sender.fullName} запросил звонок`,
          message: `Телефон для связи: <a href="tel:${ticket.sender.phone}">${ticket.sender.phone}</a>`,
          notificationTitle: 'Запрос звонка',
          notificationMessage: `${ticket.sender.fullName} запросил звонок`,
        });
      } else {
        if (ticket.sender.ID !== userId) {
          await sendNotification({
            title: 'Звонок завершен',
            message: 'Сотрудник технической поддержки указал что звонок завершен',
            user: ticket.sender,
            type: ticket.sender.type
          });
        }
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
