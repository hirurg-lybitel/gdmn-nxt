import { baseUrlApi } from '@gdmn/constants/client';
import { IMailing, IQueryOptions, IRequestResult, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type IMailingRequestResult = IRequestResult<{mailings: IMailing[], count: number}>;

export const mailingApi = createApi({
  reducerPath: 'mailing',
  tagTypes: ['mailing'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'marketing/mailings', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllMailing: builder.query<{mailings: IMailing[], count: number}, Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `${params ? `?${params}` : ''}`,
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
      query: (id) => `/${id}`,
      transformResponse: (response: IRequestResult<{mailings: IMailing[]}>) => response.queries?.mailings[0],
    }),
    addMailing: builder.mutation<IMailing, Partial<IMailing>>({
      query: (body) => ({
        url: '',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['mailing']
    }),
    updateMailing: builder.mutation<IMailing, Partial<IMailing>>({
      query(data) {
        const { ID, ...body } = data;
        return {
          url: `/${ID}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['mailing']
    }),
    deleteMailing: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['mailing']
    }),
    postTestLaunching: builder.mutation<any, { emails: string[], subject: string, template: string }>({
      query: (body) => ({
        url: '/launch-test',
        body: body,
        method: 'POST'
      }),
    })
  }),
});

export const {
  useGetAllMailingQuery,
  useGetMailingByIdQuery,
  useAddMailingMutation,
  useDeleteMailingMutation,
  useUpdateMailingMutation,
  usePostTestLaunchingMutation
} = mailingApi;
