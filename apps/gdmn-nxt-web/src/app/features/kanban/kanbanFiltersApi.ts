import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { baseUrlApi } from "../../const";
import { IKanbanFilterDeadline, IRequestResult } from "@gsbelarus/util-api-types";

type IFilterDeadlineRequestResult = IRequestResult<{filters: IKanbanFilterDeadline[]}>;
// type ILastUsedFilterDeadlineRequestResult = IRequestResult<{filter: IKanbanFilterDeadline}>;

export const kanbanFiltersApi = createApi({
  reducerPath: 'kanbanFilters',
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: builder => ({
    getFiltersDeadline: builder.query<IKanbanFilterDeadline[], void>({
      query: () => 'kanban/filters/deadline',
      transformResponse: (response: IFilterDeadlineRequestResult) => response.queries.filters || [],
    }),
    getLastUsedFilterDeadline: builder.query<IKanbanFilterDeadline | void, number>({
      query: (userId) => `kanban/filters/deadline/${userId}`,
      transformResponse: (response: IFilterDeadlineRequestResult) => response.queries.filters.length > 0 ? response.queries.filters[0] : undefined,
    }),
    postLastUsedFilterDeadline: builder.mutation<IKanbanFilterDeadline, { filter: IKanbanFilterDeadline, userId: number }>({
      query({filter, userId}) {
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
