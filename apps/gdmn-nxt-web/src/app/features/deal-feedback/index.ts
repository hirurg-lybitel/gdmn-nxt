import { baseUrlApi } from '@gdmn/constants/client';
import { IDealFeedback, IDealFeedbackCompetence, IDealFeedbackResult, IDealFeedbackSatisfaction, IDealFeedbackSatisfactionRate, IResponse } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';

export const dealFeedbackApi = createApi({
  reducerPath: 'dealFeedback',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'deal-feedback', credentials: 'include' }),
  tagTypes: ['DealFeedback'],
  endpoints: (builder) => ({
    getDealFeedback: builder.query<IDealFeedback, number>({
      query: (dealId) => `/dealId/${dealId}`,
      transformResponse: (response: IResponse<'feedback', IDealFeedback[]>) => response.queries.feedback[0],
      providesTags: (result) =>
        result
          ? [
            { type: 'DealFeedback' as const, id: result.id },
            { type: 'DealFeedback', id: 'LIST' },
          ]
          : [{ type: 'DealFeedback', id: 'LIST' }],
    }),
    addDealFeedback: builder.mutation<IDealFeedback, Partial<IDealFeedback>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IResponse<'feedback', IDealFeedback[]>) => response.queries.feedback[0],
      invalidatesTags: ['DealFeedback'],
    }),
    updateDealFeedback: builder.mutation<IDealFeedback, Partial<IDealFeedback>>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: IResponse<'feedback', IDealFeedback[]>) => response.queries.feedback[0],
      invalidatesTags: ['DealFeedback'],
    }),
    deleteDealFeedback: builder.mutation<IDealFeedback, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DealFeedback'],
    }),
    getFeedbackResults: builder.query<IDealFeedbackResult[], void>({
      query: () => '/catalogs/results',
      transformResponse: (response: IResponse<'results', IDealFeedbackResult[]>) => response.queries.results,
    }),
    getFeedbackCompetences: builder.query<IDealFeedbackCompetence[], void>({
      query: () => '/catalogs/competences',
      transformResponse: (response: IResponse<'competences', IDealFeedbackCompetence[]>) => response.queries.competences,
    }),
    getFeedbackSatisfactions: builder.query<IDealFeedbackSatisfaction[], void>({
      query: () => '/catalogs/satisfactions',
      transformResponse: (response: IResponse<'satisfactions', IDealFeedbackSatisfaction[]>) => response.queries.satisfactions,
    }),
    getFeedbackSatisfactionRates: builder.query<IDealFeedbackSatisfactionRate[], void>({
      query: () => '/catalogs/satisfactionRates',
      transformResponse: (response: IResponse<'satisfactionRates', IDealFeedbackSatisfactionRate[]>) => response.queries.satisfactionRates,
    }),
  }),
});

export const {
  useGetDealFeedbackQuery,
  useGetFeedbackResultsQuery,
  useGetFeedbackCompetencesQuery,
  useGetFeedbackSatisfactionsQuery,
  useGetFeedbackSatisfactionRatesQuery,
  useAddDealFeedbackMutation,
  useUpdateDealFeedbackMutation,
  useDeleteDealFeedbackMutation,
} = dealFeedbackApi;
