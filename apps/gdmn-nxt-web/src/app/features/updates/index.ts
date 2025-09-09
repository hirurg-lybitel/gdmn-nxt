
import { IRequestResult, IUpdateHistory } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

export interface updates {
  USR$VERSION: string,
  USR$CHANGES: string;
}

export interface fullUpdate {
  USR$VERSION: string,
  USR$CHANGES: string,
  ID: number;
}

type IUpdatesRequestResult = IRequestResult<{ updates: IUpdateHistory[]; }>;

export const updatesApi = createApi({
  reducerPath: 'updates',
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
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
