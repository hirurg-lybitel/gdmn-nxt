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
import { sendEmail } from '../../../utils/mail';
import { marked } from 'marked';
import cron from 'cron';
import { readFileSync } from 'fs';
import { createServer } from 'https';
import path from 'path';

marked.use({
  mangle: false,
  headerIds: false
});

interface NotificationsProps {
  router: Router;
}


export function Notifications({ router }: NotificationsProps) {
  const httpsServer = createServer({
    key: readFileSync(path.join(__dirname, '../../../sslcert', 'key.pem')),
    cert: readFileSync(path.join(__dirname, '../../../sslcert', 'cert.pem')),
  });

  const socketIO = new Server<
    ClientToServerEvents,
    ServerToClientEvents
  >(httpsServer, {
    cors: {
      credentials: true,
      origin: `https://${config.host}:${config.appPort}`
    }
  });

  const sessionId = 'notification';
  const users: IUser[] = [];

  console.log(`[ notifications ] socket running at https://localhost:${config.notificationPort}`);

  httpsServer.listen(config.notificationPort);

  socketIO.on('connection', (socket) => {
    console.log(`⚡ Notifications: ${socket.id} user just connected!`);

    socket.on('delete', async (notificationId) => {
      await deleteNotification(sessionId, notificationId);
      sendMessages();
    });

    socket.on('messagesByUser_request', async (userId) => {
      const notifications = await getNotifications(sessionId);
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
        await insertNotification(sessionId, message, userIDs);
      } catch (error) {
        socket.emit('sendMessageToUsers_response', 500, 'Сообщение не отправлено. Обратитесь к администратору');
        return;
      };

      sendMessages();
      socket.emit('sendMessageToUsers_response', 200, 'Сообщение успешно отправлено');
    });

    const user: IUser = {
      userId: socket.handshake.auth.userId,
      socketId: socket.id
    };

    users.push(user);

    /** выслать список уведомлений подключившемуся пользователю */
    const notifications = getNotifications(sessionId);
    const userNotifications: INotification[] = notifications[user.userId];
    socket.emit('messages', userNotifications?.map(n => {
      const { message, userId, ...mes } = n;
      return { ...mes, text: n.message };
    }) || []);

    socket.on('disconnect', () => {
      const userIndex = users.indexOf(user);
      (userIndex !== -1) && users.splice(userIndex, 1);

      console.log(`🔥: A user ${socket.id} disconnected`);
    });
  });

  async function sendMessages() {
    if (users.length === 0) return;

    /** обновить список уведомлений в базе */
    await updateNotifications(sessionId);

    /** считать актуальные уведомления */
    const notifications = await getNotifications(sessionId);

    /** отправить каждому активному пользователю из users свои уведомления */
    users.forEach(user => {
      const userNotifications: INotification[] = notifications[user.userId];

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

      users.forEach(user => {
        const { EMAIL, NAME } = user;
        const userNotifications: INotification[] = notifications[user.ID];

        if (userNotifications?.length === 0) return;

        const styles = {
          main: `
            font-family: Montserrat;
            font-weight: 400`,
          item: `
            border: 2px solid rgb(100, 181, 246);
            background-color: rgb(236, 246, 255);
            border-radius: 5px;
            padding: 0 1em;
            margin: 0.3em 0;`,
        };

        /** markdown -> html */
        const htmlText = userNotifications.map(n => `
          <li style="${styles.item}">
            <strong>${marked(n.title)}</strong>
            ${marked(n.message)}
          </li>`)
          .join('');

        const messageText = `
          <div style="${styles.main}">
            Добрый день, <strong>${NAME}</strong>.
            <p>Вот ваш список уведомлений:</p>
            <ol>
              ${htmlText}
            </ol>
            <p>Если какое-то уведомление уже неактуально, то не забудьте удалить его в <a href="http://localhost:4201/">CRM системе</a>.</p>
          </div>`;

        const from = `CRM система БелГИСС <${process.env.SMTP_USER}>`;

        const result = sendEmail(
          from,
          EMAIL,
          `У вас ${userNotifications.length} активных уведомлений`,
          '',
          messageText);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const job = new cron.CronJob('0 9-17 * * 1-5', sendEmailNotifications);
  job.start();

  setInterval(sendMessages, 15000);

  router.get('/notifications/user/:userId', getMessagesByUser);
}
