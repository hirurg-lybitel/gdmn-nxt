import { IClientHistory, IClientHistoryType, IDealDocument, IDealSource, IDenyReason, IRequestResult, ITaskType } from '@gsbelarus/util-api-types';
import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { baseQueryByUserType } from '@gdmn-nxt/store/baseUrl';

type IKanbanDealSourcesRequestResult = IRequestResult<{
  dealSources: IDealSource[];
}>;

type IDenyReasonRequestResult = IRequestResult<{
  denyReasons: IDenyReason[];
}>;

type ITaskTypesRequestResult = IRequestResult<{
  taskTypes: ITaskType[];
}>;

type IDealDocumentsRequestResult = IRequestResult<{
  documents: IDealDocument[];
}>;

type IClientHistoryRequestResult = IRequestResult<{
  clientHistory: IClientHistory[];
}>;

type IClientHistoryMutationRequestResult = IRequestResult<{
  clientHistory: IClientHistory;
}>;

type IClientHistoryTypesRequestResult = IRequestResult<{
  clientHistoryTypes: IClientHistoryType[];
}>;

type IClientHistoryTypesMutationRequestResult = IRequestResult<{
  clientHistoryTypes: IClientHistoryType;
}>;

export const kanbanCatalogsApi = createApi({
  reducerPath: 'kanbanCatalogs',
  tagTypes: ['DealSource', 'DenyReasons', 'TaskTypes', 'ClientHistory'],
  baseQuery: baseQueryByUserType({ credentials: 'include' }),
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
    deleteDealSource: builder.mutation<{ ID: number; }, number>({
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
      query(body) {
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
    deleteDenyReason: builder.mutation<{ ID: number; }, number>({
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
      query(body) {
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
    getTaskTypes: builder.query<ITaskType[], void>({
      query: (arg) => ({
        url: 'kanban/catalogs/tasktypes',
        method: 'GET'
      }),
      transformResponse: (response: ITaskTypesRequestResult) => response.queries.taskTypes || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'TaskTypes' as const, ID })),
            { type: 'TaskTypes', id: 'LIST' }
          ]
          : error
            ? [{ type: 'TaskTypes', id: 'ERROR' }]
            : [{ type: 'TaskTypes', id: 'LIST' }]
    }),
    deleteTaskType: builder.mutation<{ ID: number; }, number>({
      query(id) {
        return {
          url: `kanban/catalogs/tasktypes/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result, error) => {
        const id = result?.ID;

        return result
          ? [
            { type: 'TaskTypes' as const, id },
            { type: 'TaskTypes', id: 'LIST' }
          ]
          : error
            ? [{ type: 'TaskTypes', id: 'LIST' }]
            : [{ type: 'TaskTypes', id: 'ERROR' }];
      }
    }),
    addTaskType: builder.mutation<ITaskType, Partial<ITaskType>>({
      query: (body) => ({
        url: 'kanban/catalogs/tasktypes',
        method: 'POST',
        body
      }),
      transformResponse: (res: ITaskTypesRequestResult) => res.queries.taskTypes[0],
      invalidatesTags: (result, error) => {
        return [{ type: 'TaskTypes', id: 'LIST' }];
      }
    }),
    updateTaskType: builder.mutation<ITaskType, Partial<ITaskType>>({
      query(body) {
        const { ID: id } = body;
        return {
          url: `kanban/catalogs/tasktypes/${id}`,
          method: 'PUT',
          body
        };
      },
      transformResponse: (res: ITaskTypesRequestResult) => res.queries.taskTypes[0],
      invalidatesTags: (result, error) => {
        return result
          ? [
            { type: 'TaskTypes' as const, id: result?.ID },
            { type: 'TaskTypes', id: 'LIST' }
          ]
          : error
            ? [{ type: 'TaskTypes', id: 'ERROR' }]
            : [{ type: 'TaskTypes', id: 'LIST' }];
      },
    }),
    getDocuments: builder.query<IDealDocument[], number>({
      query: (dealId) => `kanban/catalogs/documents/${dealId}`,
      transformResponse: (response: IDealDocumentsRequestResult) => response.queries.documents || [],
    }),
    getClientHistory: builder.query<IClientHistory[], number>({
      query: (cardId) => `kanban/catalogs/client-history/${cardId}`,
      transformResponse: (response: IClientHistoryRequestResult) => response.queries.clientHistory || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'ClientHistory' as const, ID })),
            { type: 'ClientHistory', id: 'LIST' }
          ]
          : error
            ? [{ type: 'ClientHistory', id: 'ERROR' }]
            : [{ type: 'ClientHistory', id: 'LIST' }]
    }),
    addClientHistory: builder.mutation<IClientHistory, Partial<IClientHistory>>({
      query: (body) => ({
        url: 'kanban/catalogs/client-history',
        method: 'POST',
        body
      }),
      transformResponse: (response: IClientHistoryMutationRequestResult) => response.queries.clientHistory,
      invalidatesTags: (result, error) => [{ type: 'ClientHistory', id: 'LIST' }]
    }),
    updateClientHistory: builder.mutation<IClientHistory, Partial<IClientHistory>>({
      query(body) {
        const { ID: id, ...rest } = body;
        return {
          url: `kanban/catalogs/client-history/${id}`,
          method: 'PUT',
          body: rest
        };
      },
      transformResponse: (response: IClientHistoryMutationRequestResult) => response.queries.clientHistory,
      invalidatesTags: (result, error) => [{ type: 'ClientHistory', id: result?.ID }]
    }),
    getClientHistoryType: builder.query<IClientHistoryType[], void>({
      query: () => 'kanban/catalogs/client-history-types',
      transformResponse: (response: IClientHistoryTypesRequestResult) => response.queries.clientHistoryTypes || [],
    }),
    updateClientHistoryType: builder.mutation<IClientHistoryType, Partial<IClientHistoryType>>({
      query(body) {
        const { ID, ...rest } = body;
        return {
          url: `kanban/catalogs/client-history-types/${ID}`,
          method: 'PUT',
          body: rest
        };
      },
      transformResponse: (response: IClientHistoryTypesMutationRequestResult) => response.queries.clientHistoryTypes,
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
  useDeleteDenyReasonMutation,
  useGetTaskTypesQuery,
  useAddTaskTypeMutation,
  useUpdateTaskTypeMutation,
  useDeleteTaskTypeMutation,
  useGetDocumentsQuery,
  useAddClientHistoryMutation,
  useUpdateClientHistoryMutation,
  useGetClientHistoryQuery,
  useGetClientHistoryTypeQuery,
  useUpdateClientHistoryTypeMutation
} = kanbanCatalogsApi;
