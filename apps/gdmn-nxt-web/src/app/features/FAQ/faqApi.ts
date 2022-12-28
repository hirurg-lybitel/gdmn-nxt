import { Parameters } from './../../../../../../libs/util-helpers/src/lib/sql-param-parser';
import { number } from 'yup';
import { IContactWithID, IDenyReason, IKanbanCard, IKanbanColumn, IKanbanHistory, IKanbanTask, IRequestResult } from '@gsbelarus/util-api-types';
import { build } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/cacheLifecycle';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

export interface faq {
  USR$QUESTION: string,
  USR$ANSWER: string
}

export interface fullFaq {
  USR$QUESTION: string,
  USR$ANSWER: string,
  ID: number
}

export const faqApi = createApi({
  reducerPath: 'faq',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  tagTypes: ['faq'],
  endpoints: (builder) => ({
    getAllfaqs: builder.query<any, number>({
      query: () => ({
        url: 'faq',
      }),
      providesTags: result => ['faq']
    }),
    addfaq: builder.mutation<faq[], faq>({
      query: (body) => ({
        url: 'faq',
        method: 'POST',
        body
      }),
      invalidatesTags: ['faq']
    }),
    editFaq: builder.mutation<faq[], [faq, number]>({
      query: ([body, id]) => ({
        url: `faq/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['faq']
    }),
    deleteFaq: builder.mutation<faq[], number>({
      query: (id) => ({
        url: `faq/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['faq']
    })
  })
});

export const {
  useGetAllfaqsQuery,
  useAddfaqMutation,
  useEditFaqMutation,
  useDeleteFaqMutation
} = faqApi;
