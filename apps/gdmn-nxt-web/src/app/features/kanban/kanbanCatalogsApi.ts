import { IDealSource, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

// type IKanbanDealSource = {
//   dealSources: IDealSource[];
// };

type IKanbanDealSourcesRequestResult = IRequestResult<{
  dealSources: IDealSource[]
}>;

export const kanbanCatalogsApi = createApi({
  reducerPath: 'kanbanCatalogs',
  tagTypes: ['DealSource'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: builder => ({
    getDealSources: builder.query<IDealSource[], void>({
      query: () => ({ url: 'kanban/dealsource' }),
      transformResponse: (response: IKanbanDealSourcesRequestResult) => response.queries?.dealSources || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'DealSource' as const, ID })),
            { type: 'DealSource', id: 'LIST' }
          ]
          : error
            ? [{ type: 'DealSource', id: 'ERROR' }]
            : [{ type: 'DealSource', id: 'LIST' }]
    }),
    deleteDealSource: builder.mutation<{ID: number}, number>({
      query(id) {
        return {
          url: `kanban/dealsource/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result, error) => {
        const id = result?.ID;

        return result
          ? [
            { type: 'DealSource' as const, id },
            { type: 'DealSource', id: 'LIST' }
          ]
          : error
            ? [{ type: 'DealSource', id: 'LIST' }]
            : [{ type: 'DealSource', id: 'ERROR' }];
      }
    }),
    addDealSource: builder.mutation<IDealSource, Partial<IDealSource>>({
      query: (body) => ({
        url: 'kanban/dealsource',
        method: 'POST',
        body
      }),
      transformResponse: (res: IKanbanDealSourcesRequestResult) => res.queries.dealSources[0],
      invalidatesTags: (result, error) => {
        return [{ type: 'DealSource', id: 'LIST' }];
      }
    }),
    updateDealSource: builder.mutation<IDealSource, Partial<IDealSource>>({
      query (body) {
        const { ID: id } = body;
        return {
          url: `kanban/dealsource/${id}`,
          method: 'PUT',
          body
        };
      },
      transformResponse: (res: IKanbanDealSourcesRequestResult) => res.queries.dealSources[0],
      invalidatesTags: (result, error) => {
        return result
          ? [
            { type: 'DealSource' as const, id: result?.ID },
            { type: 'DealSource', id: 'LIST' }
          ]
          : error
            ? [{ type: 'DealSource', id: 'ERROR' }]
            : [{ type: 'DealSource', id: 'LIST' }];
      },
    }),
  })
});

export const {
  useGetDealSourcesQuery,
  useAddDealSourceMutation,
  useUpdateDealSourceMutation,
  useDeleteDealSourceMutation
} = kanbanCatalogsApi;
