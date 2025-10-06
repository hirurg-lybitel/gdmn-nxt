import { ServerToClientEvents, ClientToServerEvents, KanbanEvent, SocketRoom } from '@gdmn-nxt/socket';
import { Server } from 'socket.io';
import { config } from '@gdmn-nxt/config';
import path from 'path';
import { readFileSync } from 'fs';
import { createServer } from 'https';
import { IKanbanCard, IKanbanTask, UserType } from '@gsbelarus/util-api-types';
import { getUserSessionBySidAndSocket } from '@gdmn-nxt/server/utils/sessions-helper';

enum RoomsPerfix {
  AllKanban = 'allKanban',
  KanbanById = 'kanbanById:',
  AllKanbanTasks = 'allKanbanTask',
  KanbanTaskById = 'kanbanTaskById:'
}

export function StreamingUpdate() {
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

  httpsServer.listen(config.streamingUpdatePort);

  const kanbanRoomsByCard = (card: Partial<IKanbanCard>) => {
    const rooms: string[] = [RoomsPerfix.AllKanban];

    if (card.DEAL.CREATOR.ID) {
      rooms.push(`${RoomsPerfix.KanbanById}${card.DEAL.CREATOR.ID}`);
    }

    card.DEAL.PERFORMERS?.forEach((performer) => {
      rooms.push(`${RoomsPerfix.KanbanById}${performer.ID}`);
    });

    return rooms;
  };

  const kanbanTaskRoomsByTask = (card: IKanbanTask) => {
    const rooms: string[] = [RoomsPerfix.AllKanbanTasks];

    if (card.CREATOR.ID) {
      rooms.push(`${RoomsPerfix.KanbanTaskById}${card.CREATOR.ID}`);
    }

    if (card.PERFORMER.ID) {
      rooms.push(`${RoomsPerfix.KanbanTaskById}${card.PERFORMER.ID}`);
    }

    return rooms;
  };

  socketIO.on('connection', (socket) => {
    console.log(`⚡ Streaming update: ${socket.id} user just connected!`);

    // socket.on('delete', () => console.log('delete'));
    // socket.on('disconnect', () => console.log('disconnect', socket.id, socket.rooms));
    // socket.on('disconnecting', () => console.log('disconnecting', socket.id, socket.rooms));

    // Columns
    socket.on(SocketRoom.KanbanColumns, async () => {
      return socket.join(SocketRoom.KanbanColumns);
    });

    socket.on(KanbanEvent.AddColumn, (column) => {
      socketIO.to(SocketRoom.KanbanColumns).emit(KanbanEvent.AddColumn, column);
    });

    socket.on(KanbanEvent.UpdateColumn, (column) => {
      socketIO.to(SocketRoom.KanbanColumns).emit(KanbanEvent.UpdateColumn, column);
    });

    socket.on(KanbanEvent.DeleteColumn, (id) => {
      socketIO.to(SocketRoom.KanbanColumns).emit(KanbanEvent.DeleteColumn, id);
    });

    // Cards
    socket.on(SocketRoom.KanbanCards, async () => {
      const userSession = await getUserSessionBySidAndSocket(UserType.Gedemin, socket);

      const showAll = userSession.permissions?.['deals']?.ALL;

      if (!showAll) {
        return socket.join(`${RoomsPerfix.KanbanById}${userSession.contactKey}`);
      }
      return socket.join(`${RoomsPerfix.AllKanban}`);
    });

    socket.on(KanbanEvent.AddCard, (columnId, card) => {
      const rooms = kanbanRoomsByCard(card);
      socketIO.to(rooms).emit(KanbanEvent.AddCard, columnId, { ...card, STATUS: { isRead: false } });
    });

    socket.on(KanbanEvent.UpdateCard, (columnId, card) => {
      const rooms = kanbanRoomsByCard(card);
      socketIO.to(rooms).emit(KanbanEvent.UpdateCard, columnId, { ...card, STATUS: { isRead: false } });
    });

    socket.on(KanbanEvent.DeleteCard, (columnId, card) => {
      const rooms = kanbanRoomsByCard(card);
      socketIO.to(rooms).emit(KanbanEvent.DeleteCard, columnId, card);
    });

    socket.on(KanbanEvent.ReorderCards, () => {
      socketIO.to(SocketRoom.KanbanBoard).emit(KanbanEvent.ReorderCards);
    });

    // Tasks
    socket.on(SocketRoom.kanbanTasks, async () => {
      const userSession = await getUserSessionBySidAndSocket(UserType.Gedemin, socket);

      const showAll = userSession.permissions?.['tasks']?.ALL;

      if (!showAll) {
        return socket.join(`${RoomsPerfix.KanbanTaskById}${userSession.contactKey}`);
      }
      return socket.join(`${RoomsPerfix.AllKanbanTasks}`);
    });

    socket.on(KanbanEvent.AddTask, (cardId, task) => {
      const rooms = kanbanTaskRoomsByTask(task);
      socketIO.to(rooms).emit(KanbanEvent.AddTask, cardId, task);
    });

    socket.on(KanbanEvent.UpdateTask, (cardId, task) => {
      const rooms = kanbanTaskRoomsByTask(task);
      socketIO.to(rooms).emit(KanbanEvent.UpdateTask, cardId, task);
    });

    socket.on(KanbanEvent.DeleteTask, (task) => {
      const rooms = kanbanTaskRoomsByTask(task);
      socketIO.to(rooms).emit(KanbanEvent.DeleteTask, task);
    });

    socket.on(KanbanEvent.AddTaskCard, (columnIndex, task) => {
      const rooms = kanbanTaskRoomsByTask(task);
      socketIO.to(rooms).emit(KanbanEvent.AddTaskCard, columnIndex, task);
    });
    socket.on(KanbanEvent.UpdateTaskCard, (columnIndex, task) => {
      const rooms = kanbanTaskRoomsByTask(task);
      socketIO.to(rooms).emit(KanbanEvent.UpdateTaskCard, columnIndex, task);
    });
    socket.on(KanbanEvent.DeleteTaskCard, (task) => {
      const rooms = kanbanTaskRoomsByTask(task);
      socketIO.to(rooms).emit(KanbanEvent.DeleteTaskCard, task);
    });
  });
};
