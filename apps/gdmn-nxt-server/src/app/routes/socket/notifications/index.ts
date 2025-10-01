import { ClientToServerEvents, ServerToClientEvents, IUser, INotification } from '@gdmn-nxt/socket';
import { Router } from 'express';
import { Server } from 'socket.io';
import { config } from '@gdmn-nxt/config';
import { getNotifications } from '../../../controllers/socket/notifications/getNotifications';
import { deleteNotification } from '../../../controllers/socket/notifications/deleteNotification';
import { updateNotifications } from '../../../controllers/socket/notifications//updateNotifications';
import { getMessagesByUser } from '../../../controllers/socket/notifications//getMessagesByUser';
import { insertNotification } from '../../../controllers/socket/notifications//insertNotification';
import { getEmailUsers } from '../../../controllers/socket/notifications/getEmailUsers';
import { sendEmail, SmtpOptions } from '@gdmn/mailer';
import { marked } from 'marked';
import cron from 'cron';
import { readFileSync } from 'fs';
import { createServer } from 'https';
import path from 'path';
import { forEachAsync } from '@gsbelarus/util-helpers';
import { systemSettingsRepository } from '@gdmn-nxt/repositories/settings/system';
import { deleteAllNotifications } from '@gdmn-nxt/controllers/socket/notifications/deleteAllNotifications';
import { UserType } from '@gsbelarus/util-api-types';

marked.use({
  mangle: false,
  headerIds: false
});

interface NotificationsProps {
  router: Router;
}

export function Notifications({ router }: NotificationsProps) {
  const httpsServer = createServer({
    key: process.env.NODE_ENV === 'development'
      ? readFileSync(path.join(__dirname, '../../../ssl', 'private.key'))
      : readFileSync(path.join('/ssl', 'private.key')),
    cert: process.env.NODE_ENV === 'development'
      ? readFileSync(path.join(__dirname, '../../../ssl', 'public.crt'))
      : readFileSync(path.join('/ssl', 'public.crt'))
  });

  const socketIO = new Server<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpsServer, {
    cors: {
      credentials: true,
      origin: config.origin
    }
  });

  const sessionId = 'notification';
  const users: IUser[] = [];

  console.log(`[ notifications ] socket running at https://localhost:${config.notificationPort}`);

  httpsServer.listen(config.notificationPort);

  socketIO.on('connection', (socket) => {
    console.log(`⚡ Notifications: ${socket.id} user just connected!`);

    const user: IUser = {
      userId: socket.handshake.auth.userId,
      socketId: socket.id,
      userType: socket.handshake.auth.userType
    };

    users.push(user);

    socket.on('delete', async (notificationId) => {
      const user = users.find(u => u.socketId === socket.id);
      const userType = user?.userType;

      await deleteNotification(sessionId, notificationId, userType);
      await sendMessages();
    });

    socket.on('deleteAll', async (userId) => {
      const user = users.find(u => u.socketId === socket.id);
      const userType = user?.userType;

      await deleteAllNotifications(sessionId, userId, userType);
      await sendMessages();
    });

    socket.on('messagesByUser_request', async (userId) => {
      const user = users.find(u => u.socketId === socket.id);
      const userType = user?.userType;

      const notifications = await getNotifications(sessionId, userType);
      const userNotifications: INotification[] = notifications[userId];

      socket.emit('messagesByUser_response', userNotifications?.map(n => {
        const { message, userId, ...mes } = n;
        return { ...mes, text: n.message };
      }) || []);
    });

    socket.on('sendMessageToUsers_request', async (message, userIDs) => {
      if (!message || userIDs?.length === 0) {
        return;
      };

      try {
        await insertNotification({ sessionId, message, userIDs });
      } catch (error) {
        socket.emit('sendMessageToUsers_response', 500, 'Сообщение не отправлено. Обратитесь к администратору');
        return;
      };

      sendMessages();
      socket.emit('sendMessageToUsers_response', 200, 'Сообщение успешно отправлено');
    });

    /** выслать список уведомлений подключившемуся пользователю */
    const notifications = getNotifications(sessionId, socket.handshake.auth.userType);
    const userNotifications: INotification[] = notifications[user.userId];
    socket.emit('messages', userNotifications?.map(n => {
      const { message, userId, ...mes } = n;
      return { ...mes, text: n.message };
    }) || []);

    socket.on('disconnect', () => {
      const userIndex = users.indexOf(user);
      (userIndex !== -1) && users.splice(userIndex, 1);

      console.log(`🔥: Notifications: ${socket.id} user just disconnected`);
    });
  });

  async function sendMessages() {
    if (users.length === 0) return;

    /** обновить список уведомлений в базе */
    await updateNotifications(sessionId);

    /** считать актуальные уведомления */
    const notificationsGedemin = await getNotifications(sessionId, UserType.Gedemin);
    const notificationsTickets = await getNotifications(sessionId, UserType.Tickets);

    /** отправить каждому активному пользователю из users свои уведомления */
    users.forEach(user => {
      const userNotifications: INotification[] = (user.userType === UserType.Tickets ? notificationsTickets : notificationsGedemin)[user.userId];

      socketIO.to(user.socketId).emit('messages', userNotifications?.map(n => {
        const { message, userId, ...mes } = n;
        return { ...mes, text: n.message };
      }) || []);
    });
  }

  async function sendEmailNotifications() {
    const sessionId = 'mailing';
    try {
      const users = await getEmailUsers(sessionId);
      const notifications = await getNotifications(sessionId);

      const {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        OURCOMPANY: { NAME: ourCompanyName }
      } = await systemSettingsRepository.findOne(sessionId);

      const smtpOpt: SmtpOptions = {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        password: smtpPassword
      };

      await forEachAsync(users, async user => {
        const { EMAIL, NAME } = user;
        const userNotifications: INotification[] = notifications[user.ID];

        if (userNotifications?.length === 0) return;

        const styles = {
          container: `
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            line-height: 1.5;
            color: #333333;`,
          header: `
            font-size: 16px;
            color: #333333;
            margin-bottom: 24px;`,
          title: `
            font-size: 20px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 16px;`,
          list: `
            list-style-type: none;
            padding: 0;
            margin: 0;`,
          item: `
            background-color: #f5f9ff;
            border: 1px solid #e3f2fd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;`,
          itemTitle: `
            font-size: 16px;
            font-weight: 600;
            color: #1976d2;
            margin-bottom: 8px;
            display: block;`,
          itemContent: `
            font-size: 14px;
            color: #424242;
            line-height: 1.6;`,
          footer: `
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666666;`,
          link: `
            color: #1976d2;
            text-decoration: none;`
        };

        /** markdown -> html */
        const htmlText = userNotifications.map(n => `
          <li style="${styles.item}">
            <span style="${styles.itemTitle}">${marked(n.title)}</span>
            <div style="${styles.itemContent}">${marked(n.message)}</div>
          </li>`)
          .join('');

        const messageText = `
          <div style="${styles.container}">
            <div style="${styles.header}">
              Добрый день, <strong>${NAME}</strong>!
            </div>

            <div style="${styles.title}">
              Список ваших уведомлений:
            </div>

            <ul style="${styles.list}">
              ${htmlText}
            </ul>

            <div style="${styles.footer}">
              <p>Если какое-то уведомление уже неактуально, не забудьте удалить его в <a style="${styles.link}" href="${config.origin}/">CRM системе</a>.</p>
              <p style="color: #999999; font-size: 12px;">
                Это автоматическое уведомление. Пожалуйста, не отвечайте на него.
              </p>
            </div>
          </div>`;

        const from = `CRM система ${ourCompanyName} <${smtpOpt.user}>`;

        await sendEmail({
          from,
          to: EMAIL,
          subject: `У вас ${userNotifications.length} активных уведомлений`,
          html: messageText,
          options: { ...smtpOpt }
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const job = new cron.CronJob('0 9-17 * * 1-5', sendEmailNotifications);
  job.start();

  setInterval(sendMessages, 30000);

  router.get('/notifications/user/:userId', getMessagesByUser);
}
