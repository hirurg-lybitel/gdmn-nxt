import { config } from '@gdmn-nxt/config';
import { KanbanEvent, SocketRoom, getSocketClient, setSocketClient } from '@gdmn-nxt/socket';
import { IContactWithID, IDenyReason, IKanbanCard, IKanbanCardStatus, IKanbanColumn, IKanbanHistory, IKanbanTask, IRequestResult } from '@gsbelarus/util-api-types';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { io } from 'socket.io-client';
import { baseUrlApi } from '../../const';
import { getTaskStage } from '@gsbelarus/util-useful';

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

type IDenyReasonRequestResult = IRequestResult<{ denyReasons: IDenyReason[] }>;

interface IFilteringData {
  [name: string]: any;
};
export interface IDealsQueryOptions {
  userId?: number;
  filter?: IFilteringData;
};

export interface ITasksQueryOptions extends IFilteringData {
  userId?: number;
};

const socketClient = setSocketClient('streamingUpdate', {
  url: `https://${config.serverHost}:${config.streamingUpdatePort}`,
  userId: -1
});

socketClient.emit('joinToRoom', SocketRoom.KanbanBoard);

export const kanbanApi = createApi({
  reducerPath: 'kanban',
  tagTypes: ['Kanban', 'Column', 'Card', 'Task'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlApi, credentials: 'include' }),
  endpoints: (builder) => ({
    getKanbanDeals: builder.query<IKanbanColumn[], IDealsQueryOptions | void>({
      query(options) {
        // const userId = options?.userId;
        // const filter = options?.filter;

        const params: string[] = [];

        for (const [name, value] of Object.entries(options || {})) {
          switch (true) {
            case typeof value === 'object' && value !== null:
              for (const [subName, subKey] of Object.entries(value)) {
                const subParams = [];
                if (typeof subKey === 'object' && subKey !== null) {
                  for (const [subNameNested, subKeyNested] of Object.entries(subKey)) {
                    if (typeof subKeyNested === 'object' && subKeyNested !== null) {
                      subParams.push((subKeyNested as any).ID);
                    };
                    if (typeof subKeyNested === 'string' || typeof subKeyNested === 'number') {
                      subParams.push(subKeyNested);
                    };
                  }
                } else if (typeof subKey === 'boolean') {
                  subParams.push(Number(subKey));
                } else {
                  subParams.push(subKey);
                };
                params.push(`${subName}=${subParams}`);
              };
              break;
            default:
              params.push(`${name}=${value}`);
              break;
          }
        };

        return {
          url: `kanban/data/deals?${params.join('&')}`,
          method: 'GET'
        };
      },
      // async onQueryStarted() {
      //   console.log('⏩ request', 'GET', `${baseUrlApi}kanban/data/deals`);
      // },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, requestId, getCacheEntry, getState }
      ) {
        /** Cached listeners */
        let addColumnListener;
        let updateColumnListener;
        let deleteColumnListener;
        let addCardListener;
        let updateCardListener;
        let deleteCardListener;
        let reorderCardsListener;
        let addTaskListener;
        let updateTaskListener;
        let deleteTaskListener;

        try {
          await cacheDataLoaded;

          addColumnListener = (column: IKanbanColumn) => {
            updateCachedData((draft) => {
              draft.push(column);;;
            });
          };
          socketClient.on(KanbanEvent.AddColumn, addColumnListener);

          updateColumnListener = (column: IKanbanColumn) => {
            updateCachedData((draft) => {
              const findIndex = draft.findIndex(d => d.ID === column.ID);
              draft[findIndex] = { ...draft[findIndex], USR$NAME: column.USR$NAME };
            });
          };
          socketClient.on(KanbanEvent.UpdateColumn, updateColumnListener);

          deleteColumnListener = (id: number) => {
            updateCachedData((draft) => {
              draft.splice(0, draft.length, ...draft.filter(column => {
                return column.ID !== Number(id);
              }));
            });
          };
          socketClient.on(KanbanEvent.DeleteColumn, deleteColumnListener);

          addCardListener = (columnId: number, card: IKanbanCard) => {
            updateCachedData((draft) => {
              draft.forEach(column => {
                if (column.ID === Number(columnId)) {
                  column.CARDS.push(card);
                }
              });
            });
          };
          socketClient.on(KanbanEvent.AddCard, addCardListener);

          updateCardListener = (columnId: number, card: Partial<IKanbanCard>) => {
            updateCachedData((draft) => {
              draft.forEach((column, idx, columns) => {
                const findCardIndex = column.CARDS?.findIndex(c => c.ID === card.ID);
                if (findCardIndex >= 0) {
                  const findedCard = column.CARDS[findCardIndex];

                  /** Если переместили в другую колонку */
                  if (findedCard.USR$MASTERKEY !== card.USR$MASTERKEY) {
                    const sourceColumn = columns.find(c => c.ID === findedCard.USR$MASTERKEY);
                    if (sourceColumn) {
                      sourceColumn.CARDS?.splice(
                        0,
                        sourceColumn.CARDS?.length,
                        ...sourceColumn.CARDS?.filter(c => c.ID !== Number(card.ID))
                      );
                    }

                    const targetColumn = columns.find(c => c.ID === card.USR$MASTERKEY);
                    if (targetColumn) {
                      targetColumn.CARDS.unshift({ ...findedCard, ...card });
                    }
                  } else {
                    column.CARDS[findCardIndex] = { ...column.CARDS[findCardIndex], ...card };
                  }
                }
              });
            });
          };
          socketClient.on(KanbanEvent.UpdateCard, updateCardListener);

          deleteCardListener = (columnId: number, cardId: number) => {
            updateCachedData((draft) => {
              draft.forEach(column => {
                if (column.ID !== Number(columnId)) return;
                column.CARDS?.splice(0, column.CARDS?.length, ...column.CARDS?.filter(card => card.ID !== Number(cardId)));
              });
            });
          };
          socketClient.on(KanbanEvent.DeleteCard, deleteCardListener);

          reorderCardsListener = (columnId: number, cards: IKanbanCard[]) => {
            updateCachedData((draft) => {
              const findIndex = draft.findIndex(d => d.ID === Number(columnId));
              if (!draft[findIndex]?.CARDS.length) return;
              draft[findIndex].CARDS = [...cards];
            });
          };
          socketClient.on(KanbanEvent.ReorderCards, reorderCardsListener);

          addTaskListener = (cardId: number, task: IKanbanTask) => {
            updateCachedData((draft) => {
              draft.every(column => {
                const findCardIndex = column.CARDS.findIndex(c => {
                  return c.ID === Number(cardId);
                });
                if (findCardIndex < 0) return true;

                const tasks = column.CARDS[findCardIndex].TASKS;
                column.CARDS[findCardIndex].TASKS = [...(tasks || []), task];
                return false;
              });
            });
          };
          socketClient.on(KanbanEvent.AddTask, addTaskListener);

          updateTaskListener = (cardId: number, task: IKanbanTask) => {
            updateCachedData((draft) => {
              draft.forEach(column => {
                const findCardIndex = column.CARDS.findIndex(c => c.ID === Number(cardId));
                if (findCardIndex < 0) return;

                const findTaskIndex = column.CARDS[findCardIndex].TASKS?.findIndex(t => t.ID === Number(task.ID)) ?? -1;
                if (findTaskIndex < 0) return;

                const tasks = column.CARDS[findCardIndex].TASKS;
                if (!tasks?.length) return;

                tasks[findTaskIndex] = { ...tasks[findTaskIndex], ...task };
              });
            });
          };
          socketClient.on(KanbanEvent.UpdateTask, updateTaskListener);

          deleteTaskListener = (taskId: number) => {
            updateCachedData((draft) => {
              draft.forEach(column => {
                const cards = column.CARDS;
                if (!cards.length) return;

                cards.every(card => {
                  const tasks = card.TASKS;
                  if (!tasks?.length) return true;

                  const findIndex = tasks.findIndex(task => {
                    return task.ID === Number(taskId);
                  });
                  if (findIndex < 0) return true;

                  tasks.splice(findIndex, 1);
                  return false;
                });
              });
            });
          };
          socketClient.on(KanbanEvent.DeleteTask, deleteTaskListener);
        } catch (error) {
          console.error(error);
        }
        await cacheEntryRemoved;

        socketClient.off(KanbanEvent.AddColumn, addColumnListener);
        socketClient.off(KanbanEvent.UpdateColumn, updateColumnListener);
        socketClient.off(KanbanEvent.DeleteColumn, deleteColumnListener);
        socketClient.off(KanbanEvent.AddCard, addCardListener);
        socketClient.off(KanbanEvent.UpdateCard, updateCardListener);
        socketClient.off(KanbanEvent.DeleteCard, deleteCardListener);
        socketClient.off(KanbanEvent.ReorderCards, reorderCardsListener);
        socketClient.off(KanbanEvent.AddTask, addTaskListener);
        socketClient.off(KanbanEvent.UpdateTask, updateTaskListener);
        socketClient.off(KanbanEvent.DeleteTask, deleteTaskListener);
      },
      transformResponse: async (response: IKanbanRequestResult) => response.queries?.columns || [],
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
      transformResponse: (response: IKanbanRequestResult) => {
        const result = response.queries?.columns || [];

        if (result.length) {
          socketClient.emit(KanbanEvent.UpdateColumn, result[0]);
        }
        return result;
      },
      invalidatesTags: (result, error) => {
        return result
          ? [
            ...result.map(({ ID }) => ({ type: 'Column' as const, ID })),
            { type: 'Column', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Column', id: 'ERROR' }]
            : [{ type: 'Column', id: 'LIST' }];
      },
    }),
    addColumn: builder.mutation<IKanbanColumn[], Partial<IKanbanColumn>>({
      query(body) {
        return {
          url: 'kanban/columns',
          method: 'POST',
          body: body
        };
      },
      transformResponse: (response: IKanbanRequestResult) => {
        const result = response.queries?.columns || [];

        if (result.length) {
          socketClient.emit(KanbanEvent.AddColumn, result[0]);
        }

        return result;
      },
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

        if (id) {
          socketClient.emit(KanbanEvent.DeleteColumn, id);
        }

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
      transformResponse: (response: IKanbanRequestResult, meta, body) => {
        const result = response.queries?.cards || [];

        if (result.length) {
          socketClient.emit(KanbanEvent.AddCard, result[0].USR$MASTERKEY, { ...result[0], DEAL: body.DEAL });
        }

        return result;
      },
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
      transformResponse: (response: IKanbanRequestResult, meta, body) => {
        const result = response.queries?.cards || [];

        if (result.length) {
          socketClient.emit(KanbanEvent.UpdateCard, body.USR$MASTERKEY ?? -1, body);
        }

        return result;
      },
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
    deleteCard: builder.mutation<{ID: number, USR$MASTERKEY: number}, Partial<IKanbanCard>>({
      query({ ID }) {
        return {
          url: `kanban/cards/${ID}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: (result, error, body) => {
        const USR$MASTERKEY = result?.USR$MASTERKEY;

        if (result?.ID) {
          socketClient.emit(KanbanEvent.DeleteCard, result.USR$MASTERKEY, result?.ID);
          body.TASKS?.forEach(task => socketClient.emit(KanbanEvent.DeleteTaskCard, task.ID));
        }

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
      transformResponse: (response: IKanbanRequestResult) => {
        const result = response.queries?.cards || [];

        // if (result.length) {
        //   socketClient.emit(KanbanEvent.ReorderCards, result[0].USR$MASTERKEY, arg);
        // }
        return result;
      },
      // invalidatesTags: (result, error) => {
      //   return result
      //     ? [
      //       ...result.map(({ USR$MASTERKEY }) => ({ type: 'Column' as const, USR$MASTERKEY })),
      //       { type: 'Column', id: 'LIST' }
      //     ]
      //     : error
      //       ? [{ type: 'Column', id: 'LIST' }]
      //       : [{ type: 'Column', id: 'ERROR' }];
      // },
    }),
    getHistory: builder.query<IKanbanHistory[], number>({
      query: (cardId) => `kanban/history/${cardId}`,
      transformResponse: (response: IKanbanHistoryRequestResult) => {
        return response.queries?.history.map(his => ({ ...his, USR$DATE: new Date(his.USR$DATE || 0) })) || [];
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
    addTask: builder.mutation<IKanbanTask, Partial<IKanbanTask>>({
      query: (body) => ({
        url: 'kanban/tasks',
        method: 'POST',
        body
      }),
      transformResponse: (res: IKanbanRequestResult, meta, body) => {
        const result = res.queries.tasks[0];

        if (result) {
          socketClient.emit(KanbanEvent.AddTask, result.USR$CARDKEY, { ...body, ...result });

          const taskColumnIndex = getTaskStage(body);
          socketClient.emit(KanbanEvent.AddTaskCard, taskColumnIndex, { ...body, ...result });
        }

        return result;
      },
      invalidatesTags: (result, error) => {
        return [{ type: 'Task', id: 'LIST' }];
      }
    }),
    updateTask: builder.mutation<IKanbanTask, IKanbanTask>({
      query (body) {
        const { ID: id } = body;
        return {
          url: `kanban/tasks/${id}`,
          method: 'PUT',
          body
        };
      },
      transformResponse: (res: IKanbanRequestResult, meta, body) => {
        const result = res.queries.tasks[0];

        if (result) {
          socketClient.emit(KanbanEvent.UpdateTask, body.USR$CARDKEY ?? -1, body);

          const taskColumnIndex = getTaskStage(body);
          socketClient.emit(KanbanEvent.UpdateTaskCard, taskColumnIndex, body);
        }

        return result;
      },
      invalidatesTags: (result, error) => {
        return result
          ? [
            { type: 'Task' as const, id: result.ID },
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

        if (id) {
          socketClient.emit(KanbanEvent.DeleteTask, id);
          socketClient.emit(KanbanEvent.DeleteTaskCard, id);
        }

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
    getKanbanTasks: builder.query<IKanbanColumn[], ITasksQueryOptions | void>({
      query(options) {
        const params: string[] = [];

        for (const [name, value] of Object.entries(options || {})) {
          switch (true) {
            case typeof value === 'object' && value !== null: {
              const subParams = [];
              for (const [subName, subKey] of Object.entries(value)) {
                if (typeof subKey === 'object' && subKey !== null) {
                  for (const [subNameNested, subKeyNested] of Object.entries(subKey)) {
                    if (subNameNested === 'ID') subParams.push(subKeyNested);
                  };
                } else {
                  subParams.push(subKey);
                };
              };
              params.push(`${name}=${subParams}`);
              break;
            }
            case typeof value === 'boolean':
              params.push(`${name}=${Number(value).toString()}`);
              break;
            default:
              params.push(`${name}=${value}`);
              break;
          }
        };

        return {
          url: `kanban/data/tasks?${params.join('&')}`,
          method: 'GET'
        };
      },
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, requestId, getCacheEntry, getState, extra, dispatch }
      ) {
        let addTaskCardListener;
        let updateTaskCardListener;
        let deleteTaskCardListener;

        try {
          await cacheDataLoaded;

          addTaskCardListener = (columnIndex: number, task: IKanbanTask) => {
            dispatch(kanbanApi.util.invalidateTags([{ type: 'Task', id: 'LIST' }]));
            // updateCachedData((draft) => {
            //   draft[columnIndex].CARDS.unshift({
            //     ID: -1,
            //     USR$MASTERKEY: draft[columnIndex].ID,
            //     USR$INDEX: 0,
            //     TASK: { ...task },
            //     STATUS: { isRead: false },
            //   });
            // });
          };
          socketClient.on(KanbanEvent.AddTaskCard, addTaskCardListener);

          updateTaskCardListener = (columnIndex: number, newTask: IKanbanTask) => {
            dispatch(kanbanApi.util.invalidateTags([{ type: 'Task', id: newTask.ID }]));
            // updateCachedData((draft) => {
            //   draft?.every(column => {
            //     const findTaskCardIndex = column.CARDS.findIndex(({ TASK }) => TASK?.ID === newTask.ID);
            //     if (findTaskCardIndex < 0) return true;

            //     const deletedCard = column.CARDS.splice(findTaskCardIndex, 1)[0];
            //     draft[columnIndex].CARDS.unshift({
            //       ...deletedCard,
            //       STATUS: { ...deletedCard.STATUS, isRead: false },
            //       TASK: { ...deletedCard.TASK, ...newTask }
            //     });

            //     return false;
            //   });
            // });
          };
          socketClient.on(KanbanEvent.UpdateTaskCard, updateTaskCardListener);

          deleteTaskCardListener = (taskId: number) => {
            updateCachedData((draft) => {
              draft?.every(column => {
                const findTaskCardIndex = column.CARDS.findIndex(({ TASK }) => TASK?.ID === taskId);
                if (findTaskCardIndex < 0) return true;

                column.CARDS.splice(findTaskCardIndex, 1);
                return false;
              });
            });
          };
          socketClient.on(KanbanEvent.DeleteTaskCard, deleteTaskCardListener);
        } catch (error) {
          console.error(error);
        }
        await cacheEntryRemoved;

        socketClient.off(KanbanEvent.AddTaskCard, addTaskCardListener);
        socketClient.off(KanbanEvent.UpdateTaskCard, updateTaskCardListener);
        socketClient.off(KanbanEvent.DeleteTaskCard, deleteTaskCardListener);
      },
      transformResponse: async (response: IKanbanRequestResult) => response.queries?.columns || [],
      providesTags: (result, error) =>
        result
          ? [
            ...result.map(({ CARDS }) => CARDS.map(({ TASK }) => ({ type: 'Task' as const, id: TASK?.ID || -1 }))).flat(),
            { type: 'Task', id: 'LIST' }
          ]
          : error
            ? [{ type: 'Task', id: 'ERROR' }]
            : [{ type: 'Task', id: 'LIST' }]
    }),
    setCardStatus: builder.mutation<void, Partial<IKanbanCardStatus>>({
      query(body) {
        return {
          url: `kanban/cards/status/${body.cardId}`,
          body,
          method: 'POST'
        };
      },
      invalidatesTags: [{ type: 'Column', id: 'LIST' }, { type: 'Task', id: 'LIST' }]
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
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetKanbanTasksQuery,
  useSetCardStatusMutation
} = kanbanApi;
