import { IPaginationData, IQueryOptions, IRequestResult, ISegment, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseUrlApi } from '../../const';

export type ISegmentRequestResult = IRequestResult<{segments: ISegment[], count: number}>;

export const segmentApi = createApi({
  reducerPath: 'segment',
  tagTypes: ['segment'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi + 'marketing/', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllSegments: builder.query<{segments: ISegment[], count: number}, Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `segments${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: ISegmentRequestResult) => {
        if (!response.queries?.segments) {
          return {
            count: 0,
            segments: []
          };
        }
        return {
          count: response.queries.count,
          segments: response.queries?.segments
        };
      },
      providesTags: result => ['segment']
    }),
    getSegmentById: builder.query<ISegment, number>({
      query: (id) => `segments/${id}`,
      transformResponse: (response: IRequestResult<{segments: ISegment[]}>) => response.queries?.segments[0],
    }),
    addSegment: builder.mutation<ISegmentRequestResult, ISegment>({
      query: (body) => ({
        url: 'segments',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['segment']
    }),
    updateSegment: builder.mutation<ISegmentRequestResult, [ISegment, number]>({
      query: ([body, id]) => ({
        url: `segments/${id}`,
        body: body,
        method: 'PUT'
      }),
      invalidatesTags: ['segment']
    }),
    deleteSegment: builder.mutation<ISegmentRequestResult, number>({
      query: (id) => ({
        url: `segments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['segment']
    })
  }),
});

export const {
  useGetAllSegmentsQuery,
  useGetSegmentByIdQuery,
  useAddSegmentMutation,
  useDeleteSegmentMutation,
  useUpdateSegmentMutation,
} = segmentApi;
