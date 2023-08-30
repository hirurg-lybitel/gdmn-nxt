import styles from './kanban-board.module.less';
import { Box, Button, Stack } from '@mui/material';
import { useCallback, useEffect, useRef, useState, useLayoutEffect } from 'react';
import KanbanCard from '../kanban-card/kanban-card';
import KanbanColumn from '../kanban-column/kanban-column';
import AddIcon from '@mui/icons-material/Add';
// import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from '@hello-pangea/dnd';
import { IKanbanCard, IKanbanColumn, IKanbanTask, IPermissionByUser } from '@gsbelarus/util-api-types';
import {
  useAddCardMutation,
  useAddColumnMutation,
  useAddTaskMutation,
  useDeleteCardMutation,
  useDeleteColumnMutation,
  useDeleteTaskMutation,
  useReorderCardsMutation,
  useReorderColumnsMutation,
  useUpdateCardMutation,
  useUpdateColumnMutation,
  useUpdateTaskMutation
} from '../../../features/kanban/kanbanApi';
import { RootState } from '../../../store';
import { UserState } from '../../../features/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setError } from '../../../features/error-slice/error-slice';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { IChanges } from '../../../pages/Managment/deals/deals';
import { useMemo } from 'react';

export interface KanbanBoardProps {
  columns?: IKanbanColumn[];
  isLoading: boolean,
};

export function KanbanBoard(props: KanbanBoardProps) {
  const { columns: sourceColumns = [], isLoading } = props;

  const [columns, setColumns] = useState(sourceColumns);

  useLayoutEffect(() => {
    setColumns(sourceColumns);
  }, [sourceColumns]);

  const [updateColumn] = useUpdateColumnMutation();
  const [addColumn] = useAddColumnMutation();
  const [deleteColumn] = useDeleteColumnMutation();
  const [reorderColumn] = useReorderColumnsMutation();

  const [addCard, { isSuccess: addCardSuccess, data: addedCard, isLoading: isLoadingAddCard }] = useAddCardMutation();
  const [updateCard, { isSuccess: updateCardSuccess, isLoading: isLoadingEditCard, isError: updateCardIsError }] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [reorderCard, { isSuccess: reorderCardIsSuccess, isError: reorderCardIsError }] = useReorderCardsMutation();

  const [addTask, { isSuccess: addTaskSuccess }] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const addingCard = useRef<IKanbanCard>();

  const dispatch = useDispatch();

  const dragToColumnsEnable = true;
  const dragColumnsEnable = false;
  const addColumnEnable = false;
  const deleteColumnEnable = false;

  const columnHandlers = {
    handleTitleEdit: async (newColumn: IKanbanColumn) => {
      updateColumn(newColumn);
    },
    handleTitleDelete: async (column: IKanbanColumn) => {
      if (!deleteColumnEnable) {
        dispatch(setError({
          errorMessage: 'Вам запрещено удалять этапы сделок ',
          errorStatus: 1
        }));

        return;
      };
      deleteColumn(column.ID);
    },
    handleAdd: async () => {
      const newColumn: IKanbanColumn = {
        ID: -1,
        USR$INDEX: columns?.length + 1,
        USR$NAME: 'Новая группа',
        CARDS: []
      };
      addColumn(newColumn);
    }
  };

  const cardHandlers = {
    handleEditCard: async (newCard: IKanbanCard) => {
      updateCard(newCard);

      let oldCard: IKanbanCard = newCard;
      columns?.every(column => {
        const value = column?.CARDS.find(card => card.ID === newCard.ID);

        if (value) {
          oldCard = value;
          return false;
        };

        return true;
      });
    },
    handleDeleteCard: async (deletingCard: IKanbanCard) => {
      deleteCard(deletingCard);
    },
    handleAddCard: async (newCard: IKanbanCard) => {
      addingCard.current = newCard;
      addCard(newCard);
    },
    handleAddTask: (newTask: IKanbanTask) => addTask(newTask),
    handleEditTask: (newTask: IKanbanTask) => updateTask(newTask),
    handleDeleteTask: (deletingTask: IKanbanTask) => deleteTask(deletingTask.ID)
  };

  useEffect(() => {
    // console.log('useEffect', addCardSuccess, addedCard, addingCard.current?.TASKS);
    if (!addedCard) return;
    const cardId = addedCard[0].ID;
    const cardParentId = addedCard[0].USR$MASTERKEY;
    // const taskIsAddedToCache = !columns.every(({ CARDS }) => CARDS?.every(({ TASKS }) => (TASKS?.findIndex(({ ID }) => ID === cardId) ?? -1) < 0) ?? true);
    // console.log('taskIsAddedToCache', taskIsAddedToCache, columns);

    const column = columns.find(({ ID }) => ID === cardParentId);
    const cardFindIndex = column?.CARDS?.findIndex(({ ID }) => ID === cardId) ?? -1;
    const cachedCard = column?.CARDS[cardFindIndex];

    // console.log('cachedCard', cachedCard);
    // console.log('add_new_tasks_1', cachedCard?.TASKS?.length, addingCard.current?.TASKS?.length);

    if (!((addingCard.current?.TASKS?.length ?? 0) > (cachedCard?.TASKS?.length ?? 0))) return;
    // console.log('add_new_tasks_2', cachedCard?.TASKS?.length, addingCard.current?.TASKS?.length);

    addingCard.current?.TASKS?.forEach(task => cardHandlers.handleAddTask({ ...task, USR$CARDKEY: cardId }));
  }, [addCardSuccess, addedCard]);

  useEffect(() => {
    if (updateCardIsError || reorderCardIsError) {
      setColumns(sourceColumns);
    };
  }, [updateCardIsError, reorderCardIsError]);

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = useCallback(({ type, destination, source }: DropResult) => {
    if (!destination) {
      return;
    };

    if ((type === 'board') && (destination.index === source.index || !dragColumnsEnable)) {
      return;
    };

    /** Checking for moving to the same location */
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    };

    let newColumns: IKanbanColumn[] = columns || [] as IKanbanColumn[];

    if (type === 'board') {
      newColumns = reorder(
        columns,
        source.index,
        destination.index
      );

      newColumns = newColumns.map((el, index) => {
        return { ...el, USR$INDEX: index };
      });

      // setColumns(newColumns);
      reorderColumn(newColumns);
    };

    if (type === 'column') {
      /** если перемешаем внутри одной колонки */
      if (destination.droppableId === source.droppableId) {
        let newCards = reorder(
          columns[Number(source.droppableId)].CARDS,
          source.index,
          destination.index
        );

        newCards = newCards.map((el, index) => {
          return { ...el, USR$INDEX: index };
        });

        newColumns = columns.map((column, index) =>
          index === Number(source.droppableId) ? { ...column, CARDS: newCards } : column
        );

        setColumns(newColumns);
        reorderCard(newCards);
      } else {
        /** перемещаем в другую колонку */
        if (!dragToColumnsEnable) return;

        const moveCard: IKanbanCard = {
          ...columns[Number(source.droppableId)].CARDS[source.index],
          USR$MASTERKEY: columns[Number(destination.droppableId)].ID,
          USR$INDEX: destination.index
        };

        newColumns = columns.map((column, index) => {
          const cards = [...column.CARDS];
          let newCards = [...cards];
          switch (index) {
            case Number(source.droppableId):
              cards.splice(source.index, 1);
              newCards = cards.map((card, index) => ({ ...card, USR$INDEX: index }));

              // reorderCard(newCards);
              break;

            case Number(destination!.droppableId):
              cards.splice(destination!.index, 0, moveCard);
              newCards = cards.map((card, index) => ({ ...card, USR$INDEX: index }));

              // reorderCard(newCards);
              break;
          }
          return { ...column, CARDS: newCards };
        });

        setColumns(newColumns);
        updateCard(moveCard);
      }
    }
  }, [dragColumnsEnable, dragToColumnsEnable, columns]);

  const getDayDiff = useCallback((startDate: Date, endDate: Date) => {
    const msInDay = 24 * 60 * 60 * 1000;

    return Math.round(
      (startDate.getTime() - endDate.getTime()) / msInDay,
    );
  }, []);


  // if (isLoading) {
  //   return (
  //     <div
  //       style={{
  //         position: 'absolute',
  //         left: '50%',
  //         top: '50%',
  //         zIndex: 999
  //       }}
  //     >
  //       <CircularIndeterminate open={isLoading} size={100} />
  //     </div>
  //   );
  // }

  const skeletonItems = useMemo(() => (count: number): IKanbanColumn[] => {
    const skeletonFaqItems: IKanbanColumn[] = [];
    const skeletonFaqItem = {} as IKanbanColumn;
    for (let i = 0; i < count; i++) {
      skeletonFaqItems.push(
        { ...skeletonFaqItem, ID: -i - 1 }
      );
    }

    return skeletonFaqItems;
  }, []);

  const skeletonCount: IKanbanColumn[] = skeletonItems(5);

  return (
    <PerfectScrollbar
      style={{
        display: 'flex',
        paddingBottom: '10px',
        pointerEvents: isLoading ? 'none' : 'auto'
      }}
    >
      <Box display="flex" flex={1}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="board"
            type="board"
            direction="horizontal"
          >
            {(provided, snapshot) => (
              <Stack
                direction="row"
                spacing={4}
                ref={provided.innerRef}
                {...provided.droppableProps}
                display="flex"
                overflow="auto"
                flex={1}
              >
                {(isLoading ? skeletonCount : columns).map((column: IKanbanColumn, index) => (
                  <Draggable
                    key={column.ID}
                    draggableId={column.ID.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => {
                      const dragProvided: DraggableProvided = provided;
                      const dragSnapshot = snapshot;
                      return (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          display="flex"
                          flex={1}
                        >
                          <Droppable
                            key={index}
                            droppableId={`${index}`}
                            type="column"
                          >
                            {(provided, snapshot) => (
                              <Box
                                style={{
                                  display: 'flex',
                                  width: '350px',
                                }}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                <KanbanColumn
                                  provided={dragProvided}
                                  dragSnapshot={dragSnapshot}
                                  dropSnapshot={snapshot}
                                  key={column.ID || 1}
                                  item={column || {} as IKanbanColumn}
                                  columns={columns || [] as IKanbanColumn[]}
                                  onEdit={columnHandlers.handleTitleEdit}
                                  onEditCard={cardHandlers.handleEditCard}
                                  onDelete={columnHandlers.handleTitleDelete}
                                  onDeleteCard={cardHandlers.handleDeleteCard}
                                  onAddCard={cardHandlers.handleAddCard}
                                  isFetching={isLoading}
                                  addIsFetching={isLoadingAddCard}
                                >
                                  {column.CARDS
                                    ?.map((card, index) => {
                                      return (
                                        <Draggable
                                          key={card.ID + column.ID * 10}
                                          draggableId={(card.ID + column?.ID * 10)?.toString()}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <Box
                                              className={styles.boardItem}
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                            >
                                              <KanbanCard
                                                snapshot={snapshot}
                                                key={card.ID}
                                                card={card}
                                                columns={columns}
                                                onAdd={cardHandlers.handleAddCard}
                                                onEdit={cardHandlers.handleEditCard}
                                                onDelete={cardHandlers.handleDeleteCard}
                                                onAddTask={cardHandlers.handleAddTask}
                                                onEditTask={cardHandlers.handleEditTask}
                                                onDeleteTask={cardHandlers.handleDeleteTask}
                                                addIsFetching={isLoadingAddCard || isLoadingEditCard}
                                              />
                                            </Box>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                </KanbanColumn>
                              </Box>
                            )}
                          </Droppable>
                        </Box>
                      );
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
                {addColumnEnable &&
                  <Box>
                    <Button onClick={columnHandlers.handleAdd} startIcon={<AddIcon/>}>Этап</Button>
                  </Box>}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </PerfectScrollbar>
  );
}

export default KanbanBoard;
