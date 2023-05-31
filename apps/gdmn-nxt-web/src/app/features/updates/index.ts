
import { IRequestResult, IUpdateHistory } from '@gsbelarus/util-api-types';
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

// type UpdatesResponse = IUpdateHistory[];
type IUpdatesRequestResult = IRequestResult<{ updates: IUpdateHistory[] }>

export const updatesApi = createApi({
  reducerPath: 'updates',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  tagTypes: ['updates'],
  endpoints: (builder) => ({
    getAllUpdates: builder.query<IUpdateHistory[], void>({
      query: () => 'updates',
      transformResponse: (response: IUpdatesRequestResult) => response.queries?.updates || [],
      providesTags: result => ['updates']
    }),
    addUpdate: builder.mutation<IUpdateHistory[], Partial<IUpdateHistory>>({
      query: (body) => ({
        url: 'updates',
        method: 'POST',
        body: { ...body, ONDATE: new Date(body.ONDATE ?? -1).getTime() },
      }),
      invalidatesTags: ['updates']
    }),
    editUpdate: builder.mutation<IUpdateHistory[], Partial<IUpdateHistory>>({
      query: (body) => ({
        url: `updates/${body.ID}`,
        method: 'PUT',
        body: { ...body, ONDATE: new Date(body.ONDATE ?? -1).getTime() },
      }),
      invalidatesTags: ['updates']
    }),
    deleteUpdate: builder.mutation<IUpdateHistory[], number>({
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
