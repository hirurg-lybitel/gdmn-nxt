import { IQueryOptions, IRequestResult, queryOptionsToParamsString, ITicket, ITicketState } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export type ITicketsRequestResult = IRequestResult<{ tickets: ITicket[]; }>;
export type ITicketsStatesRequestResult = IRequestResult<{ ticketsStates: ITicketState[]; }>;

export const ticketsApi = createApi({
  reducerPath: 'tickets',
  tagTypes: ['tickets', 'ticketsStates'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getAllTickets: builder.query<ITicket[], Partial<{ active: boolean; } & IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `tickets${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketsRequestResult) => response.queries?.tickets || null,
      providesTags: ['tickets']
    }),
    getTicketById: builder.query<ITicket, string>({
      query: (options) => {
        return {
          url: `tickets/${options}`,
          method: 'GET'
        };
      },
      providesTags: ['tickets']
    }),
    addTicket: builder.mutation<ITicketsRequestResult, ITicket>({
      query: (body) => ({
        url: 'tickets',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['tickets']
    }),
    getAllTicketsStates: builder.query<ITicketState[], void>({
      query: (options) => {
        return {
          url: 'tickets-states',
          method: 'GET'
        };
      },
      transformResponse: (response: ITicketsStatesRequestResult) => response.queries?.ticketsStates || null,
      providesTags: ['ticketsStates']
    }),
    getTicketStateById: builder.query<ITicketState, string>({
      query: (options) => {
        return {
          url: `tickets-states/${options}`,
          method: 'GET'
        };
      },
      providesTags: ['ticketsStates']
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
  useGetTicketStateByIdQuery
} = ticketsApi;
