import { ClientToServerEvents, ServerToClientEvents, TicketEvent } from '@gdmn-nxt/socket';
import { Server } from 'socket.io';
import { config } from '@gdmn-nxt/config';
import { marked } from 'marked';
import { readFileSync } from 'fs';
import { createServer } from 'https';
import path from 'path';
import { ITicket, ticketStateCodes } from '@gsbelarus/util-api-types';
import { ticketsService } from '@gdmn-nxt/modules/tickets/service';
import { ticketsRepository } from '@gdmn-nxt/modules/tickets/repository';
import { ticketsHistoryRepository } from '@gdmn-nxt/modules/tickets-history/repository';
import { getUserSessionBySidAndSocket } from '@gdmn-nxt/server/utils/sessions-helper';

marked.use({
  mangle: false,
  headerIds: false
});

enum RoomsPerfix {
  Ticket = 'ticket:',
  TicketsByCompany = 'ticketsByCompany:',
  TicketsById = 'ticketsById:',
  AllTickets = 'allTickets'
}

export function Tickets() {
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

  console.log(`[ tickets ] socket running at https://localhost:${config.ticketsPort}`);

  httpsServer.listen(config.ticketsPort);

  const sessionID = 'tickets';

  socketIO.on('connection', (socket) => {
    console.log(`⚡ Tickets: ${socket.id} user just connected!`);

    const roomsByTicket = (ticket: ITicket) => {
      const rooms: string[] = [RoomsPerfix.AllTickets];
      if (ticket.sender?.ID) {
        rooms.push(`${RoomsPerfix.TicketsById}${ticket.sender.ID}`);
      }

      ticket.performers?.forEach((performer) => {
        rooms.push(`${RoomsPerfix.TicketsById}${performer.ID}`);
      });

      rooms.push(`${RoomsPerfix.TicketsByCompany}${ticket.company.ID}`);
      return rooms;
    };

    // Комната чата по тикету
    socket.on(TicketEvent.JoinToChat, async (ticketId, userType) => {
      const userSession = await getUserSessionBySidAndSocket(userType, socket);

      if (!userSession) return;

      const showAll = userSession.permissions?.['ticketSystem/tickets/all']?.GET;

      try {
        const ticket = await ticketsService.findOne(sessionID, ticketId, userType, userSession.id, userSession.isAdmin, userSession.companyKey, showAll);
        if (ticket?.ID) {
          socket.join(`${RoomsPerfix.Ticket}${ticketId}`);
        }
      } catch (err) {
        console.error(err, userSession.userName, userSession.id);
      }
    });

    socket.on(TicketEvent.LeaveFromChat, (ticketId) => {
      socket.leave(`${RoomsPerfix.Ticket}${ticketId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔥 Tickets: ${socket.id} user just disconnected`);
    });

    // Ивенты сообщений тикета
    socket.on(TicketEvent.NewMessage, async (message) => {
      socketIO.to(`${RoomsPerfix.Ticket}${message.ticketKey}`).emit(TicketEvent.NewMessage, message);
      if (message.state?.ID) {
        const userSession = await getUserSessionBySidAndSocket(message.user.type, socket);
        const ticket = await ticketsService.findOne(sessionID, message.ticketKey, message.user.type, userSession.id, userSession.isAdmin, userSession.companyKey, true);

        socketIO.to([...roomsByTicket(ticket), `${RoomsPerfix.Ticket}${ticket.ID}`]).emit(TicketEvent.UpdateTicket, ticket);

        const history = await ticketsHistoryRepository.find(
          sessionID,
          { USR$TICKETKEY: message.ticketKey }
        );

        const newHistory = history[history.length - 1];

        if (newHistory) {
          socketIO.to(`${RoomsPerfix.Ticket}${message.ticketKey}`).emit(TicketEvent.NewHistory, [newHistory]);
        }
      }
    });

    socket.on(TicketEvent.UpdateMessage, (message) => {
      socketIO.to(`${RoomsPerfix.Ticket}${message.ticketKey}`).emit(TicketEvent.UpdateMessage, message);
    });

    socket.on(TicketEvent.DeleteMessage, (id, ticketKey) => {
      socketIO.to(`${RoomsPerfix.Ticket}${ticketKey}`).emit(TicketEvent.DeleteMessage, id, ticketKey);
    });

    // Комната тикетов
    socket.on(TicketEvent.JoinToTicketsRoom, async (userType) => {
      const userSession = await getUserSessionBySidAndSocket(userType, socket);

      const showAll = userSession.permissions?.['ticketSystem/tickets/all']?.GET;

      if (!showAll) {
        if (userSession.isAdmin) {
          return socket.join(`${RoomsPerfix.TicketsByCompany}${userSession.companyKey}`);
        }
        return socket.join(`${RoomsPerfix.TicketsById}${userSession.id}`);
      }
      return socket.join(`${RoomsPerfix.AllTickets}`);
    });


    // Ивенты тикетов
    socket.on(TicketEvent.UpdateTicket, async (ticket) => {
      socketIO.to([...roomsByTicket(ticket), `${RoomsPerfix.Ticket}${ticket.ID}`]).emit(TicketEvent.UpdateTicket, ticket);

      const history = await ticketsHistoryRepository.find(
        sessionID,
        { USR$TICKETKEY: ticket.ID }
      );

      const lastHistory = history[history.length - 1];
      const preLastHistory = history[history.length - 2];

      if (lastHistory) {
        const lastHistoryChangeAt = new Date(lastHistory.changeAt);
        const preLastHistoryChangeAt = new Date(preLastHistory.changeAt);

        const diffMs = preLastHistoryChangeAt.getTime() - lastHistoryChangeAt.getTime();
        if (preLastHistory && diffMs < 1000 && lastHistory.user?.ID === preLastHistory.user?.ID && lastHistory.state?.code === ticketStateCodes.confirmed) {
          socketIO.to(`${RoomsPerfix.Ticket}${ticket.ID}`).emit(TicketEvent.NewHistory, [preLastHistory, lastHistory]);
        } else {
          socketIO.to(`${RoomsPerfix.Ticket}${ticket.ID}`).emit(TicketEvent.NewHistory, [lastHistory]);
        }
      }
    });

    socket.on(TicketEvent.AddTicket, async (ticket) => {
      const newTicket = await ticketsRepository.findOne(sessionID, { id: ticket.ID });
      socketIO.to(roomsByTicket(newTicket)).emit(TicketEvent.AddTicket, newTicket);
    });
  });
}
