import { IFavoriteWorkProject, IRequestResult, IWorkProject } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

type IWorkProjectRequestResult = IRequestResult<{ workProjects: IWorkProject[] }>;

export const workProjectsApi = createApi({
  reducerPath: 'workProjects',
  tagTypes: ['WorkProject'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'work-projects', credentials: 'include' }),
  endpoints: (builder) => ({
    getWorkProjects: builder.query<IWorkProject[], void>({
      query: () => '',
      transformResponse: (response: IWorkProjectRequestResult) => response.queries?.workProjects || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'WorkProject' as const, ID })),
            { type: 'WorkProject', id: 'LIST' },
          ]
          : [{ type: 'WorkProject', id: 'LIST' }],
    }),
    addWorkProject: builder.mutation<IWorkProject, Partial<IWorkProject>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IWorkProjectRequestResult) => response.queries?.workProjects[0],
      invalidatesTags: [{ type: 'WorkProject', id: 'LIST' }],
    }),
    updateWorkProject: builder.mutation<IWorkProject, Partial<IWorkProject>>({
      query: ({ ID, ...body }) => ({
        url: `/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'WorkProject', id: result?.ID }, { type: 'WorkProject', id: 'LIST' }]
          : [{ type: 'WorkProject', id: 'LIST' }],
    }),
    deleteWorkProject: builder.mutation<{ id: number }, number>({
      query(id) {
        return {
          url: `${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result) => {
        return result
          ? [{ type: 'WorkProject', id: result?.id }, { type: 'WorkProject', id: 'LIST' }]
          : [{ type: 'WorkProject', id: 'LIST' }];
      }
    }),
    addFavorite: builder.mutation<IFavoriteWorkProject, number>({
      query: (workProjectId) => ({
        url: `/favorites/${workProjectId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'WorkProject', id: 'LIST' }],
      async onQueryStarted(workProjectId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          workProjectsApi.util.updateQueryData('getWorkProjects', undefined, (draft) => {
            if (Array.isArray(draft)) {
              const findIndex = draft?.findIndex(c => c.ID === workProjectId);
              if (findIndex >= 0) {
                draft[findIndex] = { ...draft[findIndex], isFavorite: true };
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteFavorite: builder.mutation<IFavoriteWorkProject, number>({
      query: (workProjectId) => ({
        url: `/favorites/${workProjectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'WorkProject', id: 'LIST' }],
      async onQueryStarted(workProjectId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          workProjectsApi.util.updateQueryData('getWorkProjects', undefined, (draft) => {
            if (Array.isArray(draft)) {
              const findIndex = draft?.findIndex(c => c.ID === workProjectId);
              if (findIndex >= 0) {
                draft[findIndex] = { ...draft[findIndex], isFavorite: false };
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    })
  })
});


export const {
  useGetWorkProjectsQuery,
  useAddWorkProjectMutation,
  useUpdateWorkProjectMutation,
  useDeleteWorkProjectMutation,
  useAddFavoriteMutation,
  useDeleteFavoriteMutation
} = workProjectsApi;
