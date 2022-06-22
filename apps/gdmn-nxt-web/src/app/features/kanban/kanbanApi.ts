import { IContactWithID, IKanbanCard, IKanbanColumn, IKanbanHistory, IKanbanTask, IRequestResult } from '@gsbelarus/util-api-types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { baseUrlApi } from '../../const';

interface IKanban{
  columns: IKanbanColumn[];
  cards: IKanbanCard[];
  tasks: IKanbanTask[];
};

type IKanbanRequestResult = IRequestResult<IKanban>;

interface IHistory{
  history: IKanbanHistory[];
};

type IKanbanHistoryRequestResult = IRequestResult<IHistory>;

export const kanbanApi = createApi({
  reducerPath: 'kanban',
  tagTypes: ['Kanban', 'Column', 'Card', 'Task'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getKanbanDeals: builder.query<IKanbanColumn[], void>({
      query() {
        return {
          url: 'kanban/data/deals',
          method: 'GET'
        };
      },
      async onQueryStarted() {
        console.log('⏩ request', 'GET', `${baseUrlApi}kanban/data/deals`);
      },
      transformResponse: (response: IKanbanRequestResult) => response.queries?.columns || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Column' as const, ID })),
            { type: 'Column', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Column', id: 'ERROR' }]
            : [{ type: 'Column', id: 'LIST' }]

    }),
    updateColumn: builder.mutation<IKanbanColumn[], Partial<IKanbanColumn>>({
      query(body) {
        const { ID: id } = body;
        return {
          url: `kanban/columns/${id}`,
          method: 'PUT',
          body: body
        };
      },
      transformResponse: (response: IKanbanRequestResult) => response.queries?.columns || [],
      invalidatesTags: (result, error) => {
        return result
          ? [
            ...result.map(({ ID }) => ({ type: 'Column' as const, ID })),
            { type: 'Column', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Column', id: 'ERROR' }]
            : [{ type: 'Column', id: 'LIST' }];
      }
    }),
    addColumn: builder.mutation<IKanbanColumn[], Partial<IKanbanColumn>>({
      query(body) {
        return {
          url: 'kanban/columns',
          method: 'POST',
          body: body
        };
      },
      transformResponse: (response: IKanbanRequestResult) => response.queries?.columns || [],
      invalidatesTags: (result, error) => {
        return result
          ? [{ type: 'Column', id: 'LIST' }]
          : error
            ? [{ type: 'Column', id: 'ERROR' }]
            : [{ type: 'Column', id: 'LIST' }];
      }
    }),
    deleteColumn: builder.mutation<{id: number}, number>({
      query(id) {
        return {
          url: `kanban/columns/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result, error) => {
        const id = result?.id;

        return result
          ? [
            { type: 'Column' as const, id: id },
            { type: 'Column', id: 'LIST' }
          ]
          : [{ type: 'Column', id: 'LIST' }];
      }
    }),
    reorderColumns: builder.mutation<IKanbanColumn[], IKanbanColumn[]>({
      query(body) {
        return {
          url: 'kanban/reordercolumns',
          method: 'PUT',
          body: body
        };
      },
      transformResponse: (response: IKanbanRequestResult) => response.queries?.columns || [],
      invalidatesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Column' as const, ID })),
            { type: 'Column', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Column', id: 'LIST' }]
            : [{ type: 'Column', id: 'ERROR' }]
    }),
    addCard: builder.mutation<IKanbanCard[], Partial<IKanbanCard>>({
      query(body) {
        return {
          url: 'kanban/cards',
          method: 'POST',
          body: body
        };
      },
      transformResponse: (response: IKanbanRequestResult) => response.queries?.cards || [],
      invalidatesTags: (result, error) => {
        return result
          ? [...result.map(({ USR$MASTERKEY }) => ({ type: 'Column' as const, USR$MASTERKEY }))]
          : error
            ? [{ type: 'Column', id: 'ERROR' }]
            : [{ type: 'Column', id: 'LIST' }];
      }
    }),
    updateCard: builder.mutation<IKanbanCard[], Partial<IKanbanCard>>({
      query(body) {
        const { ID: id } = body;
        return {
          url: `kanban/cards/${id}`,
          method: 'PUT',
          body: body
        };
      },
      transformResponse: (response: IKanbanRequestResult) => response.queries?.cards || [],
      invalidatesTags: (result, error) => {
        return result
          ? [
            ...result.map(({ USR$MASTERKEY }) => ({ type: 'Column' as const, USR$MASTERKEY })),
            { type: 'Column', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Column', id: 'ERROR' }]
            : [{ type: 'Column', id: 'LIST' }];
      }
    }),
    deleteCard: builder.mutation<{ID: number, USR$MASTERKEY: number}, number>({
      query(id) {
        return {
          url: `kanban/cards/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result, error) => {
        const USR$MASTERKEY = result?.USR$MASTERKEY;

        return result
          ? [
            { type: 'Column' as const, id: USR$MASTERKEY },
            { type: 'Column', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Column', id: 'LIST' }]
            : [{ type: 'Column', id: 'ERROR' }];
      }
    }),
    reorderCards: builder.mutation<IKanbanCard[], IKanbanCard[]>({
      query(body) {
        return {
          url: 'kanban/reordercards',
          method: 'PUT',
          body: body
        };
      },
      transformResponse: (response: IKanbanRequestResult) => response.queries?.cards || [],
      invalidatesTags: (result, error) => {
        return result
          ? [
            ...result.map(({ USR$MASTERKEY }) => ({ type: 'Column' as const, USR$MASTERKEY })),
            { type: 'Column', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Column', id: 'LIST' }]
            : [{ type: 'Column', id: 'ERROR' }];
      }
    }),
    getHistory: builder.query<IKanbanHistory[], number>({
      query: (cardId) => `kanban/history/${cardId}`,
      onQueryStarted(cardId) {
        console.info('⏩ request', 'GET', `${baseUrlApi}kanban/history/${cardId}`);
      },
      transformResponse: (response: IKanbanHistoryRequestResult) => {
        return response.queries?.history.map(his => ({ ...his, USR$DATE: new Date(his.USR$DATE || 0) })) || [];
      },
    }),
    addHistory: builder.mutation<IKanbanHistory[], IKanbanHistory>({
      query: (body) => ({
        url: 'kanban/history',
        method: 'POST',
        body
      }),
      onQueryStarted(cardId) {
        console.info('⏩ request', 'POST', `${baseUrlApi}kanban/history`);
      },
    }),
    getTasks: builder.query<IKanbanTask[], number>({
      query: (cardId) => `kanban/tasks/${cardId}`,
      transformResponse: (res: IKanbanRequestResult) => res.queries.tasks || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ ID }) => ({ type: 'Task' as const, ID })),
            { type: 'Task', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Task', id: 'ERROR' }]
            : [{ type: 'Task', id: 'LIST' }]
    }),
    addTask: builder.mutation<IKanbanTask[], Partial<IKanbanTask>>({
      query: (body) => ({
        url: 'kanban/tasks',
        method: 'POST',
        body
      }),
      transformResponse: (res: IKanbanRequestResult) => res.queries.tasks || [],
      invalidatesTags: (result, error) => {
        return [{ type: 'Task', id: 'LIST' }];
      }
    }),
    updateTask: builder.mutation<IKanbanTask[], Partial<IKanbanTask>>({
      query (body) {
        const { ID: id } = body;
        return {
          url: `kanban/tasks/${id}`,
          method: 'PUT',
          body
        };
      },
      transformResponse: (res: IKanbanRequestResult) => res.queries.tasks || [],
      invalidatesTags: (result, error) => {
        return result
          ? [
            ...result.map(({ ID }) => ({ type: 'Task' as const, ID })),
            { type: 'Task', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Task', id: 'ERROR' }]
            : [{ type: 'Task', id: 'LIST' }];
      },
    }),
    deleteTask: builder.mutation<{ID: number}, number>({
      query(id) {
        return {
          url: `kanban/tasks/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result, error) => {
        const id = result?.ID;

        return result
          ? [
            { type: 'Task' as const, id },
            { type: 'Task', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Task', id: 'LIST' }]
            : [{ type: 'Task', id: 'ERROR' }];
      }

    }),
  })
});

export const {
  useGetKanbanDealsQuery,
  useUpdateColumnMutation,
  useAddColumnMutation,
  useDeleteColumnMutation,
  useReorderColumnsMutation,
  useAddCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useReorderCardsMutation,
  useGetHistoryQuery,
  useAddHistoryMutation,
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} = kanbanApi;
