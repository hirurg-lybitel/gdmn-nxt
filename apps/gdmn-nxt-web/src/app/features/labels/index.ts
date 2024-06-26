import { ILabel, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

interface ILabels{
  labels: ILabel[];
};

export type LabelsResponse = ILabel[];
type ILabelsRequestResult = IRequestResult<ILabels>;

type ILabelRequestResult = IRequestResult<{ label: ILabel }>;

export const labelsApi = createApi({
  reducerPath: 'labelsv2',
  tagTypes: ['Label'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getLabels: builder.query<LabelsResponse, void>({
      query: () => 'labels',
      transformResponse: (response: ILabelsRequestResult) => response.queries?.labels || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Label' as const, ID })),
            { type: 'Label', id: 'LIST' },
          ]
          : [{ type: 'Label', id: 'LIST' }],
    }),
    getLabel: builder.query<ILabel, number>({
      query: (id) => `labels/${id}`,
      transformResponse: (response: ILabelRequestResult) => response.queries?.label,
      providesTags: (result) =>
        result
          ? [{ type: 'Label', id: result?.ID }, { type: 'Label', id: 'LIST' }]
          : [{ type: 'Label', id: 'LIST' }],
    }),
    addLabel: builder.mutation<ILabel | undefined, Partial<ILabel>>({
      query: (body) => ({
        url: 'labels',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IRequestResult<{label:ILabel}>) => response.queries?.label,
      invalidatesTags: [{ type: 'Label', id: 'LIST' }],
    }),
    updateLabel: builder.mutation<ILabel, Partial<ILabel>>({
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
          ? [{ type: 'Label', id: result?.ID }, { type: 'Label', id: 'LIST' }]
          : [{ type: 'Label', id: 'LIST' }],
    }),
    deleteLabel: builder.mutation<{ id: number }, number>({
      query(id) {
        return {
          url: `labels/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result) => {
        return result
          ? [{ type: 'Label', id: result?.id }, { type: 'Label', id: 'LIST' }]
          : [{ type: 'Label', id: 'LIST' }];
      }
    }),
  })
});


export const {
  useGetLabelsQuery,
  useGetLabelQuery,
  useAddLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation
} = labelsApi;
