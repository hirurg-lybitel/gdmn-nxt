import { IQueryOptions, IRequestResult, queryOptionsToParamsString, ITicket, ITicketState, ITicketMessage, ITicketUser, IChangePassword, IAuthResult, ITicketHistory, UserType, ticketStateCodes } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';
import { getSocketClient, SocketRoom, TicketEvent } from '@gdmn-nxt/socket';
import { RootState } from '@gdmn-nxt/store';

export type ITicketsRequestResult = IRequestResult<{ tickets: ITicket[], count: number, closed: number, open: number; }>;
export type ITicketsStatesRequestResult = IRequestResult<{ ticketStates: ITicketState[]; }>;
export type ITicketMessagesRequestResult = IRequestResult<{ messages: ITicketMessage[]; }>;
export type ITicketUsersRequestResult = IRequestResult<{ users: ITicketUser[], count: number; }>;
export type ITicketUserRequestResult = IRequestResult<{ users: ITicketUser[]; }>;
export type ITicketHistoryRequestResult = IRequestResult<{ ticketsHistory: ITicketHistory[]; }>;

export const ticketsApi = createApi({
  reducerPath: 'ticketSystem',
  tagTypes: ['chat'],
  baseQuery: baseQueryByUserType({ baseUrl: 'ticketSystem', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllTickets: builder.query<{ tickets: ITicket[], count: number, closed: number, open: number; }, Partial<{ active: boolean; } & IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `/tickets${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketsRequestResult) => response.queries || null,
      async onCacheEntryAdded(arg, { updateCachedData, cacheEntryRemoved, cacheDataLoaded, getState, dispatch }) {
        await cacheDataLoaded;

        const socket = getSocketClient('tickets');

        const state = getState() as RootState;

        const userType = state.user.userProfile?.type ?? UserType.Gedemin;

        const updateTicket = (ticket: ITicket) => {
          updateCachedData((draft) => {
            if (ticket.state.code === ticketStateCodes.confirmed || (userType === UserType.Gedemin && ticket.state.code === ticketStateCodes.done)) {
              dispatch(ticketsApi.endpoints.getAllTickets.initiate(arg, { forceRefetch: true }));
            } else {
              const findIndex = draft.tickets.findIndex(d => d.ID === ticket.ID);
              draft.tickets[findIndex] = { ...ticket };
            }
          });
        };

        socket?.emit(TicketEvent.JoinToTicketsRoom, userType);

        socket?.on(TicketEvent.UpdateTicket, updateTicket);

        const addTicket = (ticket: ITicket) => {
          dispatch(ticketsApi.endpoints.getAllTickets.initiate(arg, { forceRefetch: true }));
        };

        socket?.on(TicketEvent.AddTicket, addTicket);

        await cacheEntryRemoved;
        socket?.off(TicketEvent.UpdateTicket, updateTicket);
        socket?.off(TicketEvent.AddTicket, addTicket);
      }
    }),
    getTicketById: builder.query<ITicket, number>({
      query: (id) => {
        return {
          url: `/tickets/${id}`,
          method: 'GET'
        };
      },
      async onCacheEntryAdded(id, { updateCachedData, cacheEntryRemoved, cacheDataLoaded, getState }) {
        await cacheDataLoaded;

        const socket = getSocketClient('tickets');

        const updateTicket = (ticket: ITicket) => {
          updateCachedData(() => ({ ...ticket }));
        };

        const state = getState() as RootState;

        const userType = state.user.userProfile?.type ?? UserType.Gedemin;

        socket?.emit(TicketEvent.JoinToChat, id, userType);

        socket?.on(TicketEvent.UpdateTicket, updateTicket);

        await cacheEntryRemoved;
        socket?.off(TicketEvent.UpdateTicket, updateTicket);
        socket?.emit(TicketEvent.LeaveFromChat, id);
      },
      providesTags: ['chat']
    }),
    updateTicket: builder.mutation<ITicket, Partial<ITicket>>({
      query: ({ ID, ...body }) => ({
        url: `/tickets/${ID}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ITicketsRequestResult) => {
        const result = response.queries?.tickets || [];

        const socket = getSocketClient('tickets');

        if (result.length) {
          socket?.emit(TicketEvent.UpdateTicket, result[0]);
        }

        return result[0];
      }
    }),
    addTicket: builder.mutation<ITicket, ITicket>({
      query: (body) => ({
        url: '/tickets',
        body: body,
        method: 'POST'
      }),
      transformResponse: (response: ITicketsRequestResult) => {
        const result = response.queries?.tickets || [];

        const socket = getSocketClient('tickets');

        if (result.length) {
          socket?.emit(TicketEvent.AddTicket, result[0]);
        }

        return result[0];
      }
    }),
    getAllTicketsStates: builder.query<ITicketState[], void>({
      query: (options) => {
        return {
          url: '/states',
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketsStatesRequestResult) => response.queries?.ticketStates || null
    }),
    getAllTicketMessages: builder.query<ITicketMessage[], Partial<{ id: number, userId: number; } & IQueryOptions>>({
      query: (options) => {
        const { id } = options;
        const params = queryOptionsToParamsString(options);

        return {
          url: `/messages/${id}${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      async onCacheEntryAdded({ id }, { updateCachedData, cacheEntryRemoved, cacheDataLoaded, getState }) {
        await cacheDataLoaded;

        const socket = getSocketClient('tickets');

        const newMessage = (message: ITicketMessage) => {
          updateCachedData((draft) => {
            draft.push(message);
          });
        };

        socket?.on(TicketEvent.NewMessage, newMessage);

        const updateMessage = (message: ITicketMessage) => {
          updateCachedData((draft) => {
            const findIndex = draft.findIndex(d => d.ID === message.ID);
            draft[findIndex] = { ...message };
          });
        };

        socket?.on(TicketEvent.UpdateMessage, updateMessage);

        const deleteMessage = (id: number) => {
          updateCachedData((draft) => {
            draft.splice(0, draft.length, ...draft.filter(column => {
              return column.ID !== Number(id);
            }));
          });
        };

        socket?.on(TicketEvent.DeleteMessage, deleteMessage);

        await cacheEntryRemoved;
        socket?.off(TicketEvent.NewMessage, newMessage);
        socket?.off(TicketEvent.UpdateMessage, updateMessage);
        socket?.off(TicketEvent.DeleteMessage, deleteMessage);
      },
      transformResponse: (response: ITicketMessagesRequestResult) => response.queries?.messages || null,
      providesTags: ['chat']
    }),
    addTicketMessage: builder.mutation<ITicketMessage, Partial<ITicketMessage>>({
      query: (body) => ({
        url: '/messages',
        body: body,
        method: 'POST'
      }),
      transformResponse: (response: ITicketMessagesRequestResult) => {
        const result = response.queries?.messages || [];

        const socket = getSocketClient('tickets');

        if (result.length) {
          socket?.emit(TicketEvent.NewMessage, result[0]);
        }

        return result[0];
      }
    }),
    updateTicketMessage: builder.mutation<ITicketMessage, Partial<ITicketMessage>>({
      query: ({ ID, ...body }) => ({
        url: `/messages/${ID}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ITicketMessagesRequestResult) => {
        const result = response.queries?.messages || [];

        const socket = getSocketClient('tickets');

        if (result.length) {
          socket?.emit(TicketEvent.UpdateMessage, result[0]);
        }

        return result[0];
      }
    }),
    deleteTicketMessage: builder.mutation<number, number>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: 'DELETE'
      }),
      transformResponse: ({ id, ticketKey }: { id: number, ticketKey: number; }) => {
        if (id) {
          const socket = getSocketClient('tickets');
          socket?.emit(TicketEvent.DeleteMessage, id, ticketKey);
        }

        return id;
      }
    }),
    getAllTicketHistory: builder.query<ITicketHistory[], Partial<{ id: string; } & IQueryOptions>>({
      query: (options) => {
        const { id } = options;
        const params = queryOptionsToParamsString(options);

        return {
          url: `/history/${id}${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      async onCacheEntryAdded({ id }, { updateCachedData, cacheEntryRemoved, cacheDataLoaded, getState }) {
        await cacheDataLoaded;

        const socket = getSocketClient('tickets');

        const newHistory = (history: ITicketHistory[]) => {
          updateCachedData((draft) => {
            draft.push(...history);
          });
        };

        socket?.on(TicketEvent.NewHistory, newHistory);

        await cacheEntryRemoved;
        socket?.off(TicketEvent.NewHistory, newHistory);
      },
      transformResponse: (response: ITicketHistoryRequestResult) => response.queries?.ticketsHistory || null,
      providesTags: ['chat']
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useAddTicketMutation,
  useGetTicketByIdQuery,
  useGetAllTicketsStatesQuery,
  useGetAllTicketMessagesQuery,
  useAddTicketMessageMutation,
  useUpdateTicketMutation,
  useUpdateTicketMessageMutation,
  useDeleteTicketMessageMutation,
  useGetAllTicketHistoryQuery
} = ticketsApi;
