import { baseUrlApi } from '@gdmn/constants/client';
import { IMailing, IQueryOptions, IRequestResult, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type IMailingRequestResult = IRequestResult<{mailings: IMailing[], count: number}>;

export const mailingApi = createApi({
  reducerPath: 'mailing',
  tagTypes: ['mailing'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'marketing/', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllMailing: builder.query<{mailings: IMailing[], count: number}, Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `mailing${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: IMailingRequestResult) => {
        if (!response.queries?.mailings) {
          return {
            count: 0,
            mailings: []
          };
        }
        return {
          count: response.queries.count,
          mailings: response.queries?.mailings
        };
      },
      providesTags: result => ['mailing']
    }),
    getMailingById: builder.query<IMailing, number>({
      query: (id) => `mailings/${id}`,
      transformResponse: (response: IRequestResult<{mailings: IMailing[]}>) => response.queries?.mailings[0],
    }),
    addMailing: builder.mutation<IMailingRequestResult, IMailing>({
      query: (body) => ({
        url: 'mailings',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['mailing']
    }),
    updateMailing: builder.mutation<IMailingRequestResult, [IMailing, number]>({
      query: ([body, id]) => ({
        url: `mailings/${id}`,
        body: body,
        method: 'PUT'
      }),
      invalidatesTags: ['mailing']
    }),
    deleteMailing: builder.mutation<IMailingRequestResult, number>({
      query: (id) => ({
        url: `mailings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['mailing']
    })
  }),
});

export const {
  useGetAllMailingQuery,
  useGetMailingByIdQuery,
  useAddMailingMutation,
  useDeleteMailingMutation,
  useUpdateMailingMutation,
} = mailingApi;
