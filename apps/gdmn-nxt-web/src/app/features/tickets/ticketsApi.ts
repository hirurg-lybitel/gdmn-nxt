import { IQueryOptions, IRequestResult, queryOptionsToParamsString, ITicket, ITicketState, ITicketMessage, ITicketUser, IChangePassword, IAuthResult, ITicketHistory } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export type ITicketsRequestResult = IRequestResult<{ tickets: ITicket[], count: number, closed: number, open: number; }>;
export type ITicketsStatesRequestResult = IRequestResult<{ ticketStates: ITicketState[]; }>;
export type ITicketMessagesRequestResult = IRequestResult<{ messages: ITicketMessage[]; }>;
export type ITicketUsersRequestResult = IRequestResult<{ users: ITicketUser[], count: number; }>;
export type ITicketUserRequestResult = IRequestResult<{ users: ITicketUser[]; }>;
export type ITicketHistoryRequestResult = IRequestResult<{ ticketsHistory: ITicketHistory[]; }>;

export const ticketsApi = createApi({
  reducerPath: 'ticketSystem',
  tagTypes: ['tickets', 'ticketsStates', 'users', 'messages'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'ticketSystem', credentials: 'include' }),
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
      providesTags: ['tickets']
    }),
    getTicketById: builder.query<ITicket, string>({
      query: (options) => {
        return {
          url: `/tickets/${options}`,
          method: 'GET'
        };
      },
      providesTags: ['tickets']
    }),
    updateTicket: builder.mutation<ITicket, Partial<ITicket>>({
      query: ({ ID, ...body }) => ({
        url: `/tickets/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: () => ['tickets']
    }),
    addTicket: builder.mutation<ITicketsRequestResult, ITicket>({
      query: (body) => ({
        url: '/tickets',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['tickets']
    }),
    getAllTicketsStates: builder.query<ITicketState[], void>({
      query: (options) => {
        return {
          url: '/states',
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketsStatesRequestResult) => response.queries?.ticketStates || null,
      providesTags: ['ticketsStates']
    }),
    getTicketStateById: builder.query<ITicketState, string>({
      query: (options) => {
        return {
          url: `/states/${options}`,
          method: 'GET'
        };
      },
      providesTags: ['ticketsStates']
    }),
    getAllTicketMessages: builder.query<ITicketMessage[], Partial<{ id: string; } & IQueryOptions>>({
      query: (options) => {
        const { id } = options;
        const params = queryOptionsToParamsString(options);

        return {
          url: `/messages/${id}${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketMessagesRequestResult) => response.queries?.messages || null,
      providesTags: ['messages']
    }),
    addTicketMessage: builder.mutation<ITicketsRequestResult, Partial<ITicketMessage>>({
      query: (body) => ({
        url: '/messages',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['messages']
    }),
    updateTicketMessage: builder.mutation<ITicketMessage, Partial<ITicketMessage>>({
      query: ({ ID, ...body }) => ({
        url: `/messages/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: () => ['messages']
    }),
    deleteTicketMessage: builder.mutation<{ id: number; }, number>({
      query: (id) => ({
        url: `/messages/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['messages']
    }),
    getAllTicketUser: builder.query<{ users: ITicketUser[], count: number; }, Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `/users${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketUsersRequestResult) => response.queries ?? { users: [], count: 0 },
      providesTags: ['users']
    }),
    addTicketUser: builder.mutation<ITicketUserRequestResult, ITicketUser>({
      query: (body) => ({
        url: '/users',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['users']
    }),
    deleteTicketUser: builder.mutation<IAuthResult, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['users']
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
      transformResponse: (response: ITicketHistoryRequestResult) => response.queries?.ticketsHistory || null,
      providesTags: ['messages', 'tickets']
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useAddTicketMutation,
  useGetTicketByIdQuery,
  useGetAllTicketsStatesQuery,
  useGetTicketStateByIdQuery,
  useGetAllTicketMessagesQuery,
  useAddTicketMessageMutation,
  useUpdateTicketMutation,
  useGetAllTicketUserQuery,
  useAddTicketUserMutation,
  useDeleteTicketUserMutation,
  useUpdateTicketMessageMutation,
  useDeleteTicketMessageMutation,
  useGetAllTicketHistoryQuery
} = ticketsApi;
