import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, IUser, INotification } from '@gdmn-nxt/socket';
import { Router } from 'express';
import { Server } from 'socket.io';
import { deleteNotification } from './handlers/deleteNotification';
import { getMessagesByUser } from './handlers/getMessagesByUser';
import { getNotifications } from './handlers/getNotifications';
import { insertNotification } from './handlers/insertNotification';
import { updateNotifications } from './handlers/updateNotifications';

interface NotificationsProps {
  router: Router;
}

export function Notifications({ router }: NotificationsProps) {
  const socketIO = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >({
    cors: {
      credentials: true,
      origin: `http://localhost:${process.env.NODE_ENV === 'development' ? '4200' : '80'}`
    }
  });

  const sessionId = 'notification';
  const users: IUser[] = [];

  socketIO.listen(+process.env.NX_SOCKET_PORT || 4001);

  socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

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

    // socket.emit('message', {
    //   id: 1,
    //   date: new Date(),
    //   title: 'Система',
    //   text: `Вы вошли под пользователем **${socket.id}**`
    // });

    const user: IUser = {
      userId: socket.handshake.auth.userId,
      socketId: socket.id
    };

    users.push(user);

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

  setInterval(sendMessages, 5000);

  router.get('/notifications/user/:userId', getMessagesByUser);
}
