import styles from './kanban-board.module.less';
import { Box, Button, Stack } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import KanbanCard from '../kanban-card/kanban-card';
import KanbanColumn from '../kanban-column/kanban-column';
import AddIcon from '@mui/icons-material/Add';
// import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from 'react-beautiful-dnd';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from '@hello-pangea/dnd';
import { IKanbanCard, IKanbanColumn, IPermissionByUser } from '@gsbelarus/util-api-types';
import {
  useAddCardMutation,
  useAddColumnMutation,
  useAddHistoryMutation,
  useDeleteCardMutation,
  useDeleteColumnMutation,
  useReorderCardsMutation,
  useReorderColumnsMutation,
  useUpdateCardMutation,
  useUpdateColumnMutation
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
  const { columns = [], isLoading } = props;

  const user = useSelector<RootState, UserState>(state => state.user);
  const [updateColumn] = useUpdateColumnMutation();
  const [addColumn] = useAddColumnMutation();
  const [deleteColumn] = useDeleteColumnMutation();
  const [reorderColumn] = useReorderColumnsMutation();

  const [addCard, { isSuccess: addCardSuccess, data: addedCard, isLoading: isLoadingAddCard }] = useAddCardMutation();
  const [lastAddedCard, setLastAddedCard] = useState<undefined | IKanbanCard>(undefined);
  const [lastCardShouldClear, setLastCardShouldClear] = useState<boolean>(false);
  const [updateCard, { isSuccess: updateCardSuccess, isLoading: isLoadingEditCard }] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [reorderCard] = useReorderCardsMutation();

  const [addHistory] = useAddHistoryMutation();

  const dispatch = useDispatch();

  const dragToColumnsEnable = false;
  const dragColumnsEnable = false;
  const addColumnEnable = false;
  const deleteColumnEnable = false;

  const changes = useRef<IChanges[]>([]);

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
    handleDeleteCard: async (deletinCard: IKanbanCard) => {
      deleteCard(deletinCard.ID);
    },
    handleAddCard: async (newCard: IKanbanCard) => {
      addCard(newCard);
    }
  };

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    };

    if ((result.type === 'board') && (result.destination.index === result.source.index || !dragColumnsEnable)) {
      return;
    };

    let newColumns: IKanbanColumn[] = columns || [] as IKanbanColumn[];

    if (result.type === 'board') {
      newColumns = reorder(
        columns,
        result.source.index,
        result.destination.index
      );

      newColumns = newColumns.map((el, index) => {
        return { ...el, USR$INDEX: index };
      });

      // setColumns(newColumns);
      reorderColumn(newColumns);
    };

    if (result.type === 'column') {
      /** если перемешаем внутри одной колонки */
      if (result.destination.droppableId === result.source.droppableId) {
        let newCards = reorder(
          columns[Number(result.source.droppableId)].CARDS,
          result.source.index,
          result.destination.index
        );

        newCards = newCards.map((el, index) => {
          return { ...el, USR$INDEX: index };
        });

        newColumns = columns.map((column, index) =>
          index === Number(result.source.droppableId) ? { ...column, CARDS: newCards } : column
        );

        // setColumns(newColumns);
        reorderCard(newCards);
      } else {
        /** перемещаем в другую колонку */
        if (!dragToColumnsEnable) return;

        const moveCard: IKanbanCard = {
          ...columns[Number(result.source.droppableId)].CARDS[result.source.index],
          USR$MASTERKEY: columns[Number(result.destination.droppableId)].ID,
          USR$INDEX: result.destination.index
        };

        newColumns = columns.map((column, index) => {
          const cards = [...column.CARDS];
          let newCards = [...cards];
          switch (index) {
            case Number(result.source.droppableId):
              cards.splice(result.source.index, 1);
              newCards = cards.map((card, index) => ({ ...card, USR$INDEX: index }));

              reorderCard(newCards);
              break;

            case Number(result.destination!.droppableId):
              cards.splice(result.destination!.index, 0, moveCard);
              newCards = cards.map((card, index) => ({ ...card, USR$INDEX: index }));

              reorderCard(newCards);
              break;
          }
          return { ...column, CARDS: newCards };
        });

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

  const lastCard = useMemo(() => {
    if (!lastAddedCard) return undefined;
    const cards = (columns.flatMap(cards => (cards.CARDS.map(card => card)))).find(card => card.ID === lastAddedCard?.ID);
    return cards;
  }, [columns, lastAddedCard]);

  const clearLastCard = (isAdd?: boolean) => {
    if (isAdd) {
      setLastCardShouldClear(true);
    }
    setLastAddedCard(undefined);
  };

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
          <Droppable droppableId="board" type="board" direction="horizontal">
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
                  <Draggable key={column.ID} draggableId={column.ID.toString()} index={index}>
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
                          <Droppable key={index} droppableId={`${index}`} type="column">
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
                                  lastCard={lastCard}
                                  clearLastCard={clearLastCard}
                                >
                                  {column.CARDS
                                    ?.map((card, index) => {
                                      return (
                                        <Draggable key={card.ID + column.ID * 10} draggableId={(card.ID + column?.ID * 10)?.toString()} index={index}>
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
                                                addIsFetching={isLoadingAddCard || isLoadingEditCard}
                                                lastCard={lastCard}
                                                clearLastCard={clearLastCard}
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
