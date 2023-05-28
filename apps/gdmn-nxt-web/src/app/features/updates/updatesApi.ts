
import { IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

interface IUpdatess{
  updates: fullUpdate[];
};

export interface updates {
  USR$VERSION: string,
  USR$CHANGES: string
}

export interface fullUpdate {
  USR$VERSION: string,
  USR$CHANGES: string,
  ID: number
}

type updatesResponse = fullUpdate[];
type IUpdatesRequestResult = IRequestResult<IUpdatess>

export const updatesApi = createApi({
  reducerPath: 'updates',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  tagTypes: ['updates'],
  endpoints: (builder) => ({
    getAllUpdates: builder.query<updatesResponse, void>({
      query: () => 'updates',
      transformResponse: (response: IUpdatesRequestResult) => response.queries?.updates || [],
      providesTags: result => ['updates']
    }),
    addUpdate: builder.mutation<updates[], updates>({
      query: (body) => ({
        url: 'updates',
        method: 'POST',
        body
      }),
      invalidatesTags: ['updates']
    }),
    editUpdate: builder.mutation<updates[], [updates, number]>({
      query: ([body, id]) => ({
        url: `updates/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['updates']
    }),
    deleteUpdate: builder.mutation<updates[], number>({
      query: (id) => ({
        url: `updates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['updates']
    })
  })
});

export const {
  useGetAllUpdatesQuery,
  useAddUpdateMutation,
  useEditUpdateMutation,
  useDeleteUpdateMutation
} = updatesApi;
