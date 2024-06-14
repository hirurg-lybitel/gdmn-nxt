import { baseUrlApi } from '@gdmn/constants/client';
import { IQueryOptions, IRequestResult, IFilter, queryOptionsToParamsString } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type IFilterRequestResult = IRequestResult<{filters: IFilter[]}>;

export const filtersApi = createApi({
  reducerPath: 'filters',
  tagTypes: ['filters'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getAllFilters: builder.query<IFilter[], Partial<IQueryOptions> | void>({
      query: (options) => {
        const params = queryOptionsToParamsString(options);

        return {
          url: `filters${params ? `?${params}` : ''}`,
          method: 'GET'
        };
      },
      transformResponse: (response: IFilterRequestResult) => response.queries?.filters,
      providesTags: ['filters']
    }),
    getFilterByEntityName: builder.query<IFilter, string>({
      query: (entityName) => `filters/${entityName}`,
      transformResponse: (response: IRequestResult<{filters: IFilter[]}>) => response.queries?.filters[0] || null,
      providesTags: ['filters']
    }),
    addFilter: builder.mutation<IFilterRequestResult, IFilter>({
      query: (body) => ({
        url: 'filters',
        body: body,
        method: 'POST'
      }),
      invalidatesTags: ['filters']
    }),
    updateFilter: builder.mutation<IFilterRequestResult, IFilter>({
      query: (body) => ({
        url: `filters/${body.ID}`,
        body: body,
        method: 'PUT'
      }),
      invalidatesTags: ['filters']
    }),
    deleteFilter: builder.mutation<IFilterRequestResult, number>({
      query: (id) => ({
        url: `filters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['filters']
    })
  }),
});

export const {
  useGetAllFiltersQuery,
  useGetFilterByEntityNameQuery,
  useAddFilterMutation,
  useDeleteFilterMutation,
  useUpdateFilterMutation,
} = filtersApi;
