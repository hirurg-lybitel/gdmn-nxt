import { IQueryOptions, IRequestResult, queryOptionsToParamsString, ITicket } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

export type ITicketRequestResult = IRequestResult<{ tickets: ITicket[]; }>;

export const ticketsApi = createApi({
  reducerPath: 'tickets',
  tagTypes: ['tickets'],
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
      transformResponse: (response: ITicketRequestResult) => response.queries?.tickets || null,
      providesTags: ['tickets']
    }),
    addTicket: builder.mutation<ITicketRequestResult, ITicket>({
      query: (body) => ({
        url: 'tickets',
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
  useAddTicketMutation
} = ticketsApi;
