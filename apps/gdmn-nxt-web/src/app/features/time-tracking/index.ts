import { IFavoriteProject, IFavoriteTask, IQueryOptions, IRequestResult, ITimeTrack, ITimeTrackGroup, ITimeTrackProject, ITimeTrackTask, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

type ITimeTrackingRequestResult = IRequestResult<{ timeTracking: ITimeTrack[] }>;
type ITimeTrackingGroupRequestResult = IRequestResult<{ timeTracking: ITimeTrackGroup[] }>;
type ITimeTrackerProjectsRequestResult = IRequestResult<{ timeTrackerProjects: ITimeTrackProject[] }>;
type ITimeTrackerTasksRequestResult = IRequestResult<{ timeTrackerTasks: ITimeTrackTask[] }>;

const cachedOptions: Partial<IQueryOptions>[] = [];

export const timeTrackingApi = createApi({
  reducerPath: 'timeTracking',
  tagTypes: ['TimeTrack', 'Project', 'Task'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'time-tracking', credentials: 'include' }),
  endpoints: (builder) => ({
    getTimeTracking: builder.query<ITimeTrack[], void>({
      query: () => '',
      transformResponse: (response: ITimeTrackingRequestResult) => response.queries?.timeTracking || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'TimeTrack' as const, id: ID })),
            { type: 'TimeTrack', id: 'LIST' },
          ]
          : [{ type: 'TimeTrack', id: 'LIST' }],
    }),
    getTimeTrackingByDate: builder.query<ITimeTrackGroup[], Partial<IQueryOptions> | void>({
      query: (options) => {
        /** Сохраняем параметры запроса */
        const lastOptions: Partial<IQueryOptions> = { ...options };

        if (!cachedOptions.includes(lastOptions)) {
          cachedOptions.push(lastOptions);
        }

        const params = queryOptionsToParamsString(options);

        return {
          url: `/group${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITimeTrackingGroupRequestResult) => response.queries?.timeTracking || [],
      providesTags: (result) => {
        if (!result) {
          return [{ type: 'TimeTrack', id: 'LIST' }];
        }
        const flatResult = result.reduce((acc, { items }) => acc.concat(items), [] as ITimeTrack[]);
        return [
          ...flatResult.map(({ ID }) => ({ type: 'TimeTrack' as const, id: ID })),
          { type: 'TimeTrack', id: 'LIST' },
        ];
      }
    }),
    getTimeTrackingInProgress: builder.query<ITimeTrack, void>({
      query: () => '/in-progress',
      transformResponse: (response: ITimeTrackingRequestResult) => response.queries?.timeTracking[0],
      providesTags: (result) =>
        result
          ? [
            { type: 'TimeTrack' as const, id: result.ID },
            { type: 'TimeTrack', id: 'LIST' },
          ]
          : [{ type: 'TimeTrack', id: 'LIST' }],
    }),
    addTimeTracking: builder.mutation<ITimeTrack, Partial<ITimeTrack>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ITimeTrackingRequestResult) => response.queries?.timeTracking[0],
      invalidatesTags: [{ type: 'TimeTrack', id: 'LIST' }],
    }),
    updateTimeTracking: builder.mutation<ITimeTrack, Partial<ITimeTrack>>({
      query: ({ ID, ...body }) => ({
        url: `/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'TimeTrack', id: result?.ID }, { type: 'TimeTrack', id: 'LIST' }]
          : [{ type: 'TimeTrack', id: 'LIST' }],
    }),
    deleteTimeTracking: builder.mutation<{ id: number }, number>({
      query(id) {
        return {
          url: `${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result) => {
        return result
          ? [{ type: 'TimeTrack', id: result?.id }, { type: 'TimeTrack', id: 'LIST' }]
          : [{ type: 'TimeTrack', id: 'LIST' }];
      }
    }),
    getProjects: builder.query<ITimeTrackProject[], Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `/projects${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITimeTrackerProjectsRequestResult) => response.queries?.timeTrackerProjects || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Project' as const, id: ID })),
            { type: 'Project', id: 'LIST' },
          ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    getTasks: builder.query<ITimeTrackTask[], Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `/tasks${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ITimeTrackerTasksRequestResult) => response.queries?.timeTrackerTasks ?? [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Task' as const, id: ID })),
            { type: 'Task', id: 'LIST' },
          ]
          : [{ type: 'Task', id: 'LIST' }],
    }),
    getTask: builder.query<ITimeTrackTask, number>({
      query: (id) => ({
        url: `/tasks/${id}`
      }),
      transformResponse: (response: ITimeTrackerTasksRequestResult) => response.queries?.timeTrackerTasks[0] ?? {},
      providesTags: (result) =>
        result
          ? [
            { type: 'Task' as const, id: result.ID },
            { type: 'Task', id: 'LIST' },
          ]
          : [{ type: 'Task', id: 'LIST' }],
    }),
    addFavoriteTask: builder.mutation<IFavoriteTask, number>({
      query: (taksId) => ({
        url: `/tasks/favorites/${taksId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      // async onQueryStarted(taksId, { dispatch, queryFulfilled }) {
      //   const patchResult = dispatch(
      //     timeTrackingApi.util.updateQueryData('getTasks', undefined, (draft) => {
      //       if (Array.isArray(draft)) {
      //         const findIndex = draft?.findIndex(c => c.ID === taksId);
      //         if (findIndex >= 0) {
      //           draft[findIndex] = { ...draft[findIndex], isFavorite: true };
      //         }
      //       }
      //     })
      //   );
      //   try {
      //     await queryFulfilled;
      //   } catch {
      //     patchResult.undo();
      //   }
      // },
    }),
    deleteFavoriteTask: builder.mutation<IFavoriteTask, number>({
      query: (taksId) => ({
        url: `/tasks/favorites/${taksId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      // async onQueryStarted(taksId, { dispatch, queryFulfilled }) {
      //   const patchResult = dispatch(
      //     workProjectsApi.util.updateQueryData('getTasks', undefined, (draft) => {
      //       if (Array.isArray(draft)) {
      //         const findIndex = draft?.findIndex(c => c.ID === taksId);
      //         if (findIndex >= 0) {
      //           draft[findIndex] = { ...draft[findIndex], isFavorite: false };
      //         }
      //       }
      //     })
      //   );
      //   try {
      //     await queryFulfilled;
      //   } catch {
      //     patchResult.undo();
      //   }
      // },
    }),
    addFavoriteProject: builder.mutation<IFavoriteProject, number>({
      query: (taksId) => ({
        url: `/projects/favorites/${taksId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      // async onQueryStarted(taksId, { dispatch, queryFulfilled }) {
      //   const patchResult = dispatch(
      //     timeTrackingApi.util.updateQueryData('getTasks', undefined, (draft) => {
      //       if (Array.isArray(draft)) {
      //         const findIndex = draft?.findIndex(c => c.ID === taksId);
      //         if (findIndex >= 0) {
      //           draft[findIndex] = { ...draft[findIndex], isFavorite: true };
      //         }
      //       }
      //     })
      //   );
      //   try {
      //     await queryFulfilled;
      //   } catch {
      //     patchResult.undo();
      //   }
      // },
    }),
    deleteFavoriteProject: builder.mutation<IFavoriteProject, number>({
      query: (taksId) => ({
        url: `/projects/favorites/${taksId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      // async onQueryStarted(taksId, { dispatch, queryFulfilled }) {
      //   const patchResult = dispatch(
      //     workProjectsApi.util.updateQueryData('getTasks', undefined, (draft) => {
      //       if (Array.isArray(draft)) {
      //         const findIndex = draft?.findIndex(c => c.ID === taksId);
      //         if (findIndex >= 0) {
      //           draft[findIndex] = { ...draft[findIndex], isFavorite: false };
      //         }
      //       }
      //     })
      //   );
      //   try {
      //     await queryFulfilled;
      //   } catch {
      //     patchResult.undo();
      //   }
      // },
    })
  })
});


export const {
  useAddTimeTrackingMutation,
  useUpdateTimeTrackingMutation,
  useDeleteTimeTrackingMutation,
  useGetTimeTrackingQuery,
  useGetTimeTrackingByDateQuery,
  useGetTimeTrackingInProgressQuery,
  useGetProjectsQuery,
  useGetTasksQuery,
  useGetTaskQuery,
  useAddFavoriteTaskMutation,
  useDeleteFavoriteTaskMutation,
  useAddFavoriteProjectMutation,
  useDeleteFavoriteProjectMutation
} = timeTrackingApi;
