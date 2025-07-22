import { IQueryOptions, IRequestResult, queryOptionsToParamsString, ITicket, ITicketState, ITicketMessage } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export type ITicketsRequestResult = IRequestResult<{ tickets: ITicket[]; }>;
export type ITicketsStatesRequestResult = IRequestResult<{ ticketStates: ITicketState[]; }>;
export type ITicketMessagesRequestResult = IRequestResult<{ messages: ITicketMessage[]; }>;

export const ticketsApi = createApi({
  reducerPath: 'tickets',
  tagTypes: ['tickets', 'ticketsStates'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'tickets', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllTickets: builder.query<ITicket[], Partial<{ active: boolean; } & IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketsRequestResult) => response.queries?.tickets || null,
      providesTags: ['tickets']
    }),
    getTicketById: builder.query<ITicket, string>({
      query: (options) => {
        return {
          url: `/byId/${options}`,
          method: 'GET'
        };
      },
      providesTags: ['tickets']
    }),
    updateTicket: builder.mutation<ITicket, Partial<ITicket>>({
      query: ({ ID, ...body }) => ({
        url: `/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: () => ['tickets']
    }),
    addTicket: builder.mutation<ITicketsRequestResult, ITicket>({
      query: (body) => ({
        url: '',
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
      providesTags: ['tickets']
    }),
    addTicketMessage: builder.mutation<ITicketsRequestResult, Partial<ITicketMessage>>({
      query: (body) => ({
        url: '/messages',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['tickets']
    }),
    // getFilterByEntityName: builder.query<IFilter, string>({
    //   query: (entityName) => `filters/${entityName}`,
    //   transformResponse: (response: IRequestResult<{ filters: IFilter[]; }>) => response.queries?.filters[0] || null,
    //   providesTags: ['filters']
    // }),
    // addFilter: builder.mutation<ITicketRequestResult, IFilter>({
    //   query: (body) => ({
    //     url: 'filters',
    //     body: body,
    //     method: 'POST'
    //   }),
    //   invalidatesTags: ['filters']
    // }),
    // updateFilter: builder.mutation<ITicketRequestResult, IFilter>({
    //   query: (body) => ({
    //     url: `filters/${body.ID}`,
    //     body: body,
    //     method: 'PUT'
    //   }),
    //   invalidatesTags: ['filters']
    // }),
    // deleteFilter: builder.mutation<ITicketRequestResult, number>({
    //   query: (id) => ({
    //     url: `filters/${id}`,
    //     method: 'DELETE',
    //   }),
    //   invalidatesTags: ['filters']
    // })
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
  useUpdateTicketMutation
} = ticketsApi;
