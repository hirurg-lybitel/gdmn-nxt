import { IDealSource, IDenyReason, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

// type IKanbanDealSource = {
//   dealSources: IDealSource[];
// };

type IKanbanDealSourcesRequestResult = IRequestResult<{
  dealSources: IDealSource[]
}>;

type IDenyReasonRequestResult = IRequestResult<{
  denyReasons: IDenyReason[]
}>;

export const kanbanCatalogsApi = createApi({
  reducerPath: 'kanbanCatalogs',
  tagTypes: ['DealSource', 'DenyReasons'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: builder => ({
    getDealSources: builder.query<IDealSource[], void>({
      query: () => ({ url: 'kanban/catalogs/dealsource' }),
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
          url: `kanban/catalogs/dealsource/${id}`,
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
        url: 'kanban/catalogs/dealsource',
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
          url: `kanban/catalogs/dealsource/${id}`,
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
    getDenyReasons: builder.query<IDenyReason[], void>({
      query: (arg) => ({
        url: 'kanban/catalogs/denyreasons',
        method: 'GET'
      }),
      transformResponse: (response: IDenyReasonRequestResult) => response.queries.denyReasons || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'DenyReasons' as const, ID })),
            { type: 'DenyReasons', id: 'LIST' }
          ]
          : error
            ? [{ type: 'DenyReasons', id: 'ERROR' }]
            : [{ type: 'DenyReasons', id: 'LIST' }]
    }),
    deleteDenyReason: builder.mutation<{ID: number}, number>({
      query(id) {
        return {
          url: `kanban/catalogs/denyreasons/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result, error) => {
        const id = result?.ID;

        return result
          ? [
            { type: 'DenyReasons' as const, id },
            { type: 'DenyReasons', id: 'LIST' }
          ]
          : error
            ? [{ type: 'DenyReasons', id: 'LIST' }]
            : [{ type: 'DenyReasons', id: 'ERROR' }];
      }
    }),
    addDenyReason: builder.mutation<IDenyReason, Partial<IDenyReason>>({
      query: (body) => ({
        url: 'kanban/catalogs/denyreasons',
        method: 'POST',
        body
      }),
      transformResponse: (res: IDenyReasonRequestResult) => res.queries.denyReasons[0],
      invalidatesTags: (result, error) => {
        return [{ type: 'DenyReasons', id: 'LIST' }];
      }
    }),
    updateDenyReason: builder.mutation<IDenyReason, Partial<IDenyReason>>({
      query (body) {
        const { ID: id } = body;
        return {
          url: `kanban/catalogs/denyreasons/${id}`,
          method: 'PUT',
          body
        };
      },
      transformResponse: (res: IDenyReasonRequestResult) => res.queries.denyReasons[0],
      invalidatesTags: (result, error) => {
        return result
          ? [
            { type: 'DenyReasons' as const, id: result?.ID },
            { type: 'DenyReasons', id: 'LIST' }
          ]
          : error
            ? [{ type: 'DenyReasons', id: 'ERROR' }]
            : [{ type: 'DenyReasons', id: 'LIST' }];
      },
    }),
  })
});

export const {
  useGetDealSourcesQuery,
  useAddDealSourceMutation,
  useUpdateDealSourceMutation,
  useDeleteDealSourceMutation,
  useGetDenyReasonsQuery,
  useAddDenyReasonMutation,
  useUpdateDenyReasonMutation,
  useDeleteDenyReasonMutation
} = kanbanCatalogsApi;
