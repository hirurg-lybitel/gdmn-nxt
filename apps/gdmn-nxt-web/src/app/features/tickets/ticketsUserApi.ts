import { IQueryOptions, IRequestResult, queryOptionsToParamsString, ITicket, ITicketState, ITicketMessage, ITicketUser, IAuthResult, ITicketHistory } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

export type ITicketsRequestResult = IRequestResult<{ tickets: ITicket[], count: number, closed: number, open: number; }>;
export type ITicketsStatesRequestResult = IRequestResult<{ ticketStates: ITicketState[]; }>;
export type ITicketMessagesRequestResult = IRequestResult<{ messages: ITicketMessage[]; }>;
export type ITicketUsersRequestResult = IRequestResult<{ users: ITicketUser[], count: number; }>;
export type ITicketUserRequestResult = IRequestResult<{ users: ITicketUser[]; }>;
export type ITicketHistoryRequestResult = IRequestResult<{ ticketsHistory: ITicketHistory[]; }>;

export const ticketsUserApi = createApi({
  reducerPath: 'ticketsUser',
  tagTypes: ['users'],
  baseQuery: baseQueryByUserType({ baseUrl: 'ticketSystem', credentials: 'include' }),
  endpoints: (builder) => ({
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
    getTicketUserById: builder.query<ITicketUser, number>({
      query: (id) => {
        return {
          url: `/userById/${id}`,
          method: 'GET'
        };
      },
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
    })
  }),
});

export const {
  useGetAllTicketUserQuery,
  useAddTicketUserMutation,
  useDeleteTicketUserMutation,
  useGetTicketUserByIdQuery
} = ticketsUserApi;
