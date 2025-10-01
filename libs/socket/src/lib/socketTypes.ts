import { IKanbanCard, IKanbanColumn, IKanbanTask, ITicket, ITicketHistory, ITicketMessage, UserType } from '@gsbelarus/util-api-types';
export interface InterServerEvents {
  ping: () => void;
  joinToRoom: (roomName: string) => void;
}
export interface ServerToClientEvents extends InterServerEvents, KanbanEvents, TicketEvents {
  messages: (data: IMessage[]) => void;
  messagesByUser_response: (data: IMessage[]) => void;
  sendMessageToUsers_response: (status: number, statusText: string) => void;
}

export interface ClientToServerEvents extends InterServerEvents, KanbanEvents, TicketEvents {
  delete: (notificationId: number) => void;
  deleteAll: (userId: number) => void;
  messagesByUser_request: (userId: number) => void;
  sendMessageToUsers_request: (message: string, userIDs: number[]) => void;
}

export interface IMessage {
  id: number;
  date: Date;
  title: string;
  text: string;
  action?: NotificationAction;
  actionContent?: string;
};

export interface IUser {
  userId: number;
  socketId: string;
  userType: UserType;
};

export enum NotificationAction {
  JumpToDeal = 1,
  JumpToTask = 2,
  JumpToTicket = 3
}

export interface INotification {
  id: number;
  date: Date;
  userId?: number;
  title: string;
  message: string;
  action?: NotificationAction;
  actionContent?: string;
}

export enum SocketRoom {
  KanbanBoard = 'KanbanBoard'
}

export enum KanbanEvent {
  AddColumn = 'add_column',
  UpdateColumn = 'update_column',
  DeleteColumn = 'delete_column',
  AddCard = 'add_card',
  UpdateCard = 'update_card',
  DeleteCard = 'delete_card',
  ReorderCards = 'reorder_card',
  AddTask = 'add_task',
  UpdateTask = 'update_task',
  DeleteTask = 'delete_task',
  AddTaskCard = 'add_task_card',
  UpdateTaskCard = 'update_task_card',
  DeleteTaskCard = 'delete_task_card',
}

interface KanbanEvents {
  [KanbanEvent.AddColumn]: (column: IKanbanColumn) => void;
  [KanbanEvent.UpdateColumn]: (column: IKanbanColumn) => void;
  [KanbanEvent.DeleteColumn]: (id: number) => void;
  [KanbanEvent.AddCard]: (columnId: number, card: IKanbanCard) => void;
  [KanbanEvent.UpdateCard]: (columnId: number, card: Partial<IKanbanCard>) => void;
  [KanbanEvent.DeleteCard]: (columnId: number, id: number) => void;
  [KanbanEvent.ReorderCards]: (columnId: number, cards: IKanbanCard[]) => void;
  [KanbanEvent.AddTask]: (cardId: number, task: IKanbanTask) => void;
  [KanbanEvent.UpdateTask]: (cardId: number, task: IKanbanTask) => void;
  [KanbanEvent.DeleteTask]: (id: number) => void;
  [KanbanEvent.AddTaskCard]: (columnIndex: number, task: IKanbanTask) => void;
  [KanbanEvent.UpdateTaskCard]: (columnIndex: number, taskCard: IKanbanTask) => void;
  [KanbanEvent.DeleteTaskCard]: (id: number) => void;
}

export enum TicketEvent {
  JoinToChat = 'join_to_chat',
  LeaveFromChat = 'leave_from_chat',
  NewMessage = 'new_message',
  UpdateMessage = 'update_message',
  DeleteMessage = 'delete_message',

  NewHistory = 'new_history',

  JoinToTicketsRoom = 'join_to_tickets_room',
  UpdateTicket = 'update_ticket',
  AddTicket = 'add_ticket'
}

interface TicketEvents {
  [TicketEvent.JoinToChat]: (ticketId: number, userType: UserType) => void;
  [TicketEvent.LeaveFromChat]: (ticketId: number) => void;
  [TicketEvent.NewMessage]: (message: ITicketMessage) => void;
  [TicketEvent.UpdateMessage]: (message: ITicketMessage) => void;
  [TicketEvent.DeleteMessage]: (id: number, ticketKey: number) => void;

  [TicketEvent.NewHistory]: (message: ITicketHistory[]) => void;

  [TicketEvent.JoinToTicketsRoom]: (userType: UserType) => void;
  [TicketEvent.UpdateTicket]: (ticket: ITicket) => void;
  [TicketEvent.AddTicket]: (ticket: ITicket) => void;
}
