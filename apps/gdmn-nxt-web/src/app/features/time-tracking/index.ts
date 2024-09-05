import { IQueryOptions, IRequestResult, ITimeTrack, ITimeTrackGroup, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '@gdmn/constants/client';

type ITimeTrackingRequestResult = IRequestResult<{ timeTracking: ITimeTrack[] }>;
type ITimeTrackingGroupRequestResult = IRequestResult<{ timeTracking: ITimeTrackGroup[] }>;

const cachedOptions: Partial<IQueryOptions>[] = [];

export const timeTrackingApi = createApi({
  reducerPath: 'timeTracking',
  tagTypes: ['TimeTrack'],
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
  })
});


export const {
  useAddTimeTrackingMutation,
  useUpdateTimeTrackingMutation,
  useDeleteTimeTrackingMutation,
  useGetTimeTrackingQuery,
  useGetTimeTrackingByDateQuery,
  useGetTimeTrackingInProgressQuery
} = timeTrackingApi;
