import { ILabel, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

interface ILabels {
  labels: ILabel[];
};

export type LabelsResponse = ILabel[];
type ILabelsRequestResult = IRequestResult<ILabels>;

export const ticketsLabelsApi = createApi({
  reducerPath: 'ticketsLabels',
  tagTypes: ['label'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'ticketSystem', credentials: 'include' }),
  endpoints: (builder) => ({
    getTicketsLabels: builder.query<LabelsResponse, void>({
      query: () => 'labels',
      transformResponse: (response: ILabelsRequestResult) => response.queries?.labels || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'label' as const, ID })),
            { type: 'label', id: 'LIST' },
          ]
          : [{ type: 'label', id: 'LIST' }],
    }),
    addTicketsLabel: builder.mutation<ILabel | undefined, Partial<ILabel>>({
      query: (body) => ({
        url: 'labels',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ILabelsRequestResult) => response.queries?.labels[0],
      invalidatesTags: [{ type: 'label', id: 'LIST' }],
    }),
    updateTicketsLabel: builder.mutation<ILabel, Partial<ILabel>>({
      query(data) {
        const { ID, ...body } = data;
        return {
          url: `labels/${ID}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: (result) =>
        result
          ? [{ type: 'label', id: result?.ID }, { type: 'label', id: 'LIST' }]
          : [{ type: 'label', id: 'LIST' }],
    }),
    deleteTicketsLabel: builder.mutation<{ id: number; }, number>({
      query(id) {
        return {
          url: `labels/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result) => {
        return result
          ? [{ type: 'label', id: result?.id }, { type: 'label', id: 'LIST' }]
          : [{ type: 'label', id: 'LIST' }];
      }
    }),
  })
});


export const {
  useGetTicketsLabelsQuery,
  useAddTicketsLabelMutation,
  useUpdateTicketsLabelMutation,
  useDeleteTicketsLabelMutation
} = ticketsLabelsApi;
