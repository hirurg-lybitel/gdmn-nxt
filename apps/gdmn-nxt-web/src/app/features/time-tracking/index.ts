import { IFavoriteProject, IFavoriteTask, IQueryOptions, IRequestResult, ITimeTrack, ITimeTrackGroup, ITimeTrackProject, ITimeTrackTask, IProjectStatistics, queryOptionsToParamsString, IProjectType, IResponse } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

type ITimeTrackingRequestResult = IRequestResult<{ timeTracking: ITimeTrack[] }>;
type ITimeTrackingGroupRequestResult = IRequestResult<{ timeTracking: ITimeTrackGroup[] }>;
type ITimeTrackerProjectsRequestResult = IRequestResult<{ timeTrackerProjects: ITimeTrackProject[] }>;
type ITimeTrackerTasksRequestResult = IRequestResult<{ timeTrackerTasks: ITimeTrackTask[] }>;
type IProjectStatisticsRequestResult = IRequestResult<{statistics: IProjectStatistics[]}>
type IProjectTypeRequestResult = IRequestResult<{timeTrackingProjectsTypes: IProjectType[]}>

const cachedOptions: Partial<IQueryOptions>[] = [];

const projectsCachedOptions: Partial<IQueryOptions>[] = [];

export const timeTrackingApi = createApi({
  reducerPath: 'timeTracking',
  tagTypes: ['TimeTrack', 'Project', 'Task', 'ProjectType'],
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
    getProjects: builder.query<{projects: ITimeTrackProject[], rowCount: number}, Partial<IQueryOptions> | void>({
      query: (options) => {
        const lastOptions: Partial<IQueryOptions> = { ...options };

        if (!projectsCachedOptions.includes(lastOptions)) {
          projectsCachedOptions.push(lastOptions);
        }

        const params = queryOptionsToParamsString(options);

        return {
          url: `/projects${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: IRequestResult<{projects: ITimeTrackProject[], rowCount: number}>) => response.queries,
      providesTags: (result) =>
        result
          ? [
            ...result.projects.map(({ ID }) => ({ type: 'Project' as const, id: ID })),
            { type: 'Project', id: 'LIST' },
          ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    addProject: builder.mutation<ITimeTrackProject, ITimeTrackProject>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ITimeTrackerProjectsRequestResult) => response.queries.timeTrackerProjects[0],
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      async onQueryStarted({ ID, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data: addedProject } = await queryFulfilled;
          cachedOptions.forEach(async opt => {
            const options = Object.keys(opt).length > 0 ? opt : undefined;
            dispatch(
              timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
                const findIndex = draft?.projects.findIndex(({ ID }) => ID === addedProject.ID);
                if (findIndex > 0) return;

                draft?.projects.unshift(addedProject);
                if (draft.rowCount) draft.rowCount += 1;
              })
            );
          });
        } catch (error) {
          console.error(error);
        }
      },
    }),
    updateProject: builder.mutation<ITimeTrackProject, ITimeTrackProject>({
      query: ({ ID, ...body }) => ({
        url: `/projects/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'Project', id: result?.ID }, { type: 'Project', id: 'LIST' }]
          : [{ type: 'Project', id: 'LIST' }],
      async onQueryStarted(project, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft.projects)) {
                const projectIndex = draft.projects?.findIndex(c => c.ID === project.ID);

                if (projectIndex < 0) return;

                draft.projects[projectIndex] = { ...project };
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    deleteProject: builder.mutation<{ id: number }, number>({
      query(id) {
        return {
          url: `/projects/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result) => {
        return result
          ? [{ type: 'Project', id: result?.id }, { type: 'Project', id: 'LIST' }]
          : [{ type: 'Project', id: 'LIST' }];
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft.projects)) {
                const projectIndex = draft.projects?.findIndex(c => c.ID === id);

                if (projectIndex < 0) return;

                draft?.projects.splice(projectIndex, 1);
                if (draft.rowCount) draft.rowCount -= 1;
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    getProjectTypes: builder.query<IProjectType[], void>({
      query: () => '/projectTypes',
      transformResponse: (response: IProjectTypeRequestResult) => response.queries?.timeTrackingProjectsTypes || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'ProjectType' as const, id: ID })),
            { type: 'ProjectType', id: 'LIST' },
          ]
          : [{ type: 'ProjectType', id: 'LIST' }],
    }),
    addProjectType: builder.mutation<IProjectType, Partial<ITimeTrack>>({
      query: (body) => ({
        url: '/projectTypes',
        method: 'POST',
        body,
      }),
      transformResponse: (response: IProjectTypeRequestResult) => response.queries?.timeTrackingProjectsTypes[0],
      invalidatesTags: [{ type: 'ProjectType', id: 'LIST' }],
    }),
    updateProjectType: builder.mutation<IProjectType, Partial<ITimeTrack>>({
      query: ({ ID, ...body }) => ({
        url: `/projectTypes/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'ProjectType', id: result?.ID }, { type: 'ProjectType', id: 'LIST' }]
          : [{ type: 'ProjectType', id: 'LIST' }],
    }),
    deleteProjectType: builder.mutation<{ id: number }, number>({
      query(id) {
        return {
          url: `/projectTypes/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result) => {
        return result
          ? [{ type: 'ProjectType', id: result?.id }, { type: 'ProjectType', id: 'LIST' }]
          : [{ type: 'ProjectType', id: 'LIST' }];
      }
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
    addTimeTrackTask: builder.mutation<ITimeTrackTask, Partial<ITimeTrackTask>>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ITimeTrackerTasksRequestResult) => response.queries?.timeTrackerTasks[0],
      invalidatesTags: [{ type: 'Task', id: 'LIST' }, { type: 'Project', id: 'LIST' }],
    }),
    updateTimeTrackTask: builder.mutation<ITimeTrackTask, ITimeTrackTask>({
      query: ({ ID, ...body }) => ({
        url: `/tasks/${ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) =>
        result
          ? [{ type: 'Task', id: result?.ID }, { type: 'Task', id: 'LIST' }, { type: 'Project', id: 'LIST' }]
          : [{ type: 'Task', id: 'LIST' }, { type: 'Project', id: 'LIST' }],
      async onQueryStarted(task, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft.projects)) {
                const projectIndex = draft.projects.findIndex(c => c.ID === task.project?.ID);
                const tasks = draft.projects[projectIndex]?.tasks;

                if (!tasks) {
                  return;
                }

                if (projectIndex < 0) {
                  return;
                }

                const taskIndex = tasks?.findIndex(c => c.ID === task.ID);
                if (taskIndex < 0) {
                  return;
                }

                const newTasks = draft.projects[projectIndex]?.tasks;

                if (!newTasks) {
                  return;
                }
                newTasks[taskIndex] = task;
                draft.projects[projectIndex] = { ...draft.projects[projectIndex], tasks: newTasks };
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    deleteTimeTrackTask: builder.mutation<{ id: number }, number>({
      query(id) {
        return {
          url: `/tasks/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (result) => {
        return result
          ? [{ type: 'Task', id: result?.id }, { type: 'Task', id: 'LIST' }, { type: 'Project', id: 'LIST' }]
          : [{ type: 'Task', id: 'LIST' }, { type: 'Project', id: 'LIST' }];
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft.projects)) {
                const projectIndex = draft.projects.findIndex(project => project.tasks?.findIndex(task => task.ID === id) !== -1);
                const tasks = draft.projects[projectIndex]?.tasks;

                if (!tasks) {
                  return;
                }

                if (projectIndex < 0) {
                  return;
                }

                const taskIndex = tasks?.findIndex((c, i) => c.ID === id);

                if (taskIndex < 0) {
                  return;
                }

                const newTasks = draft.projects[projectIndex]?.tasks;

                if (!newTasks) {
                  return;
                }

                newTasks.splice(taskIndex, 1);

                draft.projects[projectIndex] = { ...draft.projects[projectIndex], tasks: newTasks };
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    addFavoriteTask: builder.mutation<IFavoriteTask, {taskId: number, projectId: number}>({
      query: ({ taskId }) => ({
        url: `/tasks/favorites/${taskId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      async onQueryStarted({ taskId, projectId }, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft)) {
                const projectIndex = draft?.findIndex(c => c.ID === projectId);
                const tasks: ITimeTrackTask[] = draft[projectIndex]?.tasks;

                if (!tasks) {
                  return;
                }

                if (projectIndex < 0) {
                  return;
                }

                const taskIndex = tasks?.findIndex(c => c.ID === taskId);
                if (taskIndex < 0) {
                  return;
                }

                const newTasks = draft[projectIndex]?.tasks;

                if (!newTasks) {
                  return;
                }
                newTasks[taskIndex].isFavorite = true;
                draft[projectIndex] = { ...draft[projectIndex], tasks: newTasks };
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    deleteFavoriteTask: builder.mutation<IFavoriteTask, {taskId: number, projectId: number}>({
      query: ({ taskId }) => ({
        url: `/tasks/favorites/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      async onQueryStarted({ taskId, projectId }, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft)) {
                const projectIndex = draft?.findIndex(c => c.ID === projectId);
                const tasks: ITimeTrackTask[] = draft[projectIndex]?.tasks;

                if (!tasks) {
                  return;
                }

                if (projectIndex < 0) {
                  return;
                }


                const taskIndex = tasks.findIndex(c => c.ID === taskId);

                if (taskIndex < 0) {
                  return;
                }


                const newTasks = draft[projectIndex]?.tasks;

                if (!newTasks) {
                  return;
                }

                newTasks[taskIndex].isFavorite = false;
                draft[projectIndex] = { ...draft[projectIndex], tasks: newTasks };
              }
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        });
      },
    }),
    addFavoriteProject: builder.mutation<IFavoriteProject, number>({
      query: (projectId) => ({
        url: `/projects/favorites/${projectId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      async onQueryStarted(projectId, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft)) {
                const findIndex = draft?.findIndex(c => c.ID === projectId);
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
        });
      },
    }),
    deleteFavoriteProject: builder.mutation<IFavoriteProject, number>({
      query: (projectId) => ({
        url: `/projects/favorites/${projectId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      async onQueryStarted(projectId, { dispatch, queryFulfilled }) {
        projectsCachedOptions?.forEach(async opt => {
          const options = Object.keys(opt).length > 0 ? opt : undefined;
          const patchResult = dispatch(
            timeTrackingApi.util.updateQueryData('getProjects', options, (draft) => {
              if (Array.isArray(draft)) {
                const findIndex = draft?.findIndex(c => c.ID === projectId);
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
        });
      },
    }),
    getStatistics: builder.query<IProjectStatistics[], {projectId: number, options: Partial<IQueryOptions> | void}>({
      query: ({ projectId, options }) => {
        const params = queryOptionsToParamsString(options);
        return `/projects/statistics/${projectId}${params ? `?${params}` : ''}`;
      },
      transformResponse: (response: IResponse<'statistics', IProjectStatistics[]>) => response.queries.statistics || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'TimeTrack' as const, id })),
            { type: 'TimeTrack', id: 'LIST' },
          ]
          : [{ type: 'TimeTrack', id: 'LIST' }]
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
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectTypesQuery,
  useAddProjectTypeMutation,
  useUpdateProjectTypeMutation,
  useDeleteProjectTypeMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  useAddTimeTrackTaskMutation,
  useUpdateTimeTrackTaskMutation,
  useDeleteTimeTrackTaskMutation,
  useAddFavoriteTaskMutation,
  useDeleteFavoriteTaskMutation,
  useAddFavoriteProjectMutation,
  useDeleteFavoriteProjectMutation,
  useGetStatisticsQuery
} = timeTrackingApi;
