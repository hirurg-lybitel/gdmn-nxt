import { IContactWithID, IDenyReason, IKanbanCard, IKanbanColumn, IKanbanHistory, IKanbanTask, IRequestResult } from '@gsbelarus/util-api-types';
import { build } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/cacheLifecycle';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

export interface faq {
  question: string,
  answer: string
}

export interface editFaq {
  faq: faq,
  index: number
}

export const faqApi = createApi({
  reducerPath: 'faq',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi }),
  tagTypes: ['faq'],
  endpoints: (builder) => ({
    getAllfaqs: builder.query<faq[], number>({
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
    editFaq: builder.mutation<faq[], editFaq>({
      query: (body) => ({
        url: 'faq',
        method: 'PUT',
        body
      }),
      invalidatesTags: ['faq']
    }),
    deleteFaq: builder.mutation<faq[], number>({
      query: (index) => ({
        url: 'faq',
        method: 'DELETE',
        body: { 'index': index }
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
