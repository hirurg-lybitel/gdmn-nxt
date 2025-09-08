import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { IKanbanFilterDeadline, IRequestResult } from '@gsbelarus/util-api-types';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

type IFilterDeadlineRequestResult = IRequestResult<{ filters: IKanbanFilterDeadline[]; }>;
// type ILastUsedFilterDeadlineRequestResult = IRequestResult<{filter: IKanbanFilterDeadline}>;

export const kanbanFiltersApi = createApi({
  reducerPath: 'kanbanFilters',
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
  endpoints: builder => ({
    getFiltersDeadline: builder.query<IKanbanFilterDeadline[], void>({
      query: () => 'kanban/filters/deadline',
      transformResponse: (response: IFilterDeadlineRequestResult) => response.queries.filters || [],
    }),
    getLastUsedFilterDeadline: builder.query<IKanbanFilterDeadline | void, number>({
      query: (userId) => `kanban/filters/deadline/${userId}`,
      transformResponse: (response: IFilterDeadlineRequestResult) => response.queries.filters.length > 0 ? response.queries.filters[0] : undefined,
    }),
    postLastUsedFilterDeadline: builder.mutation<IKanbanFilterDeadline, { filter: IKanbanFilterDeadline, userId: number; }>({
      query({ filter, userId }) {
        return {
          url: `kanban/filters/deadline/${userId}`,
          method: 'POST',
          body: filter
        };
      },
    })
  })
});

export const {
  useGetFiltersDeadlineQuery,
  useGetLastUsedFilterDeadlineQuery,
  usePostLastUsedFilterDeadlineMutation
} = kanbanFiltersApi;
