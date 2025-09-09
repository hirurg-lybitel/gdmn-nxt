import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';
import { ICustomerFeedback, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';

type IFeedbackRequestResult = IRequestResult<{ feedback: ICustomerFeedback[]; }>;

export const customerFeedbackApi = createApi({
  reducerPath: 'customerFeedback',
  tagTypes: ['CustomerFeedback'],
  baseQuery: baseQueryByUserType({ baseUrl: 'feedback', credentials: 'include' }),
  endpoints: (builder) => ({
    getFeedbackByCustomer: builder.query<ICustomerFeedback[], number>({
      query: (customerId) => `/customerId/${customerId}`,
      transformResponse: (response: IFeedbackRequestResult) => response.queries?.feedback || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'CustomerFeedback' as const, ID })),
            { type: 'CustomerFeedback', id: 'LIST' },
          ]
          : [{ type: 'CustomerFeedback', id: 'LIST' }],
    }),
    addFeedback: builder.mutation<ICustomerFeedback, Partial<ICustomerFeedback>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body
      }),
      transformResponse: (response: IFeedbackRequestResult) => response.queries.feedback[0],
      invalidatesTags: ['CustomerFeedback']
    }),
    updateFeedback: builder.mutation<ICustomerFeedback, Partial<ICustomerFeedback>>({
      query: ({ ID, ...body }) => ({
        url: `/${ID}`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: IFeedbackRequestResult) => response.queries.feedback[0],
      invalidatesTags: ['CustomerFeedback']
    }),
    deleteFeedback: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CustomerFeedback']
    })
  })
});

export const {
  useGetFeedbackByCustomerQuery,
  useAddFeedbackMutation,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation
} = customerFeedbackApi;
