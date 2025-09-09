import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';
import { ICustomer, IQueryOptions, IRequestResult, ISegment, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/query/react';

export type ISegmentRequestResult = IRequestResult<{ segments: ISegment[], count: number; }>;

type ISegmentCustomersRequestResult = IRequestResult<{ customers: ICustomer[]; }>;

export const segmentApi = createApi({
  reducerPath: 'segment',
  tagTypes: ['segment'],
  baseQuery: baseQueryByUserType({ baseUrl: 'marketing/', credentials: 'include' }),
  endpoints: (builder) => ({
    getAllSegments: builder.query<{ segments: ISegment[], count: number; }, Partial<IQueryOptions> | void>({
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
      transformResponse: (response: IRequestResult<{ segments: ISegment[]; }>) => response.queries?.segments[0],
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
    }),
    getCustomersCount: builder.mutation<{ count: number; }, { includeSegments: ISegment[], excludeSegments: ISegment[]; }>({
      query: (body) => ({
        url: 'segments/calc',
        body: body,
        method: 'POST'
      }),
    }),
    getCustomersBySegment: builder.mutation<ICustomer[], { includeSegments: ISegment[], excludeSegments: ISegment[]; }>({
      query: (body) => ({
        url: 'segments/customers',
        body: body,
        method: 'POST'
      }),
      transformResponse: (response: ISegmentCustomersRequestResult) => response.queries.customers ?? []
    }),
  }),
});

export const {
  useGetAllSegmentsQuery,
  useGetSegmentByIdQuery,
  useAddSegmentMutation,
  useDeleteSegmentMutation,
  useUpdateSegmentMutation,
  useGetCustomersCountMutation,
  useGetCustomersBySegmentMutation
} = segmentApi;
