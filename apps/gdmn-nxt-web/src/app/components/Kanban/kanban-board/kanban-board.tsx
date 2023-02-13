import './kanban-board.module.less';
import { Box, Button, Stack } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import KanbanCard from '../kanban-card/kanban-card';
import KanbanColumn from '../kanban-column/kanban-column';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from 'react-beautiful-dnd';
import { IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';
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
import { compareCards, IChanges } from '../../../pages/Managment/deals/deals';
import { useMemo } from 'react';

// export interface IChanges {
//   id: number;
//   fieldName: string,
//   oldValue: string | number | undefined;
//   newValue: string | number | undefined;
// };
export interface KanbanBoardProps {
  columns?: IKanbanColumn[];
  isLoading: boolean
};

export function KanbanBoard(props: KanbanBoardProps) {
  const { columns = [], isLoading } = props;

  const user = useSelector<RootState, UserState>(state => state.user);
  const [updateColumn] = useUpdateColumnMutation();
  const [addColumn] = useAddColumnMutation();
  const [deleteColumn] = useDeleteColumnMutation();
  const [reorderColumn] = useReorderColumnsMutation();

  const [addCard, { isSuccess: addCardSuccess, data: addedCard }] = useAddCardMutation();
  const [updateCard, { isSuccess: updateCardSuccess }] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [reorderCard] = useReorderCardsMutation();

  const [addHistory] = useAddHistoryMutation();

  const dispatch = useDispatch();

  const dragToColumnsEnable = false;
  const dragColumnsEnable = false;
  const addColumnEnable = false;
  const deleteColumnEnable = false;

  const changes = useRef<IChanges[]>([]);

  // const user = useSelector<RootState, UserState>(state => state.user);

  // useEffect(()=>{
  //   setColumns(inColumns);
  //   // dispatch(fetchCustomers());
  // }, [inColumns]);

  useEffect(()=>{
    if ((updateCardSuccess) && changes.current?.length > 0) {
      changes.current.forEach(item =>
        addHistory({
          ID: -1,
          USR$CARDKEY: item.id,
          USR$TYPE: '2',
          USR$DESCRIPTION: item.fieldName,
          USR$OLD_VALUE: item.oldValue?.toString() || '',
          USR$NEW_VALUE: item.newValue?.toString() || '',
          USR$USERKEY: user.userProfile?.id || -1
        })
      );

      changes.current = [];
    };
  }, [updateCardSuccess]);

  useEffect(() => {
    if (addCardSuccess && addedCard) {
      changes.current.forEach(item =>
        addHistory({
          ID: -1,
          USR$CARDKEY: addedCard[0].ID,
          USR$TYPE: '1',
          USR$DESCRIPTION: item.fieldName,
          USR$OLD_VALUE: item.oldValue?.toString() || '',
          USR$NEW_VALUE: item.newValue?.toString() || '',
          USR$USERKEY: user.userProfile?.id || -1
        })
      );

      changes.current = [];
    };
  }, [addCardSuccess, addedCard]);

  // const compareCards = (newCard: any, oldCard: IKanbanCard) => {
  //   const changesArr: IChanges[] = [];

  //   const deal = newCard['DEAL'];
  //   const contact = newCard['DEAL']['CONTACT'] || {};
  //   const performer = newCard['DEAL']['PERFORMER'] || {};

  //   if ((deal['USR$AMOUNT'] || 0) !== (oldCard.DEAL?.USR$AMOUNT || 0)) {
  //     changesArr.push({
  //       id: newCard.ID,
  //       fieldName: 'Сумма',
  //       oldValue: Number(oldCard.DEAL?.USR$AMOUNT) || 0,
  //       newValue: deal['USR$AMOUNT'] || 0
  //     });
  //   }
  //   if (contact['ID'] !== oldCard.DEAL?.CONTACT?.ID) {
  //     changesArr.push({
  //       id: newCard.ID,
  //       fieldName: 'Клиент',
  //       oldValue: oldCard.DEAL?.CONTACT?.NAME,
  //       newValue: contact['NAME']
  //     });
  //   };
  //   if (deal['USR$NAME'] !== oldCard.DEAL?.USR$NAME) {
  //     changesArr.push({
  //       id: newCard.ID,
  //       fieldName: 'Наименование',
  //       oldValue: oldCard.DEAL?.USR$NAME,
  //       newValue: deal['USR$NAME']
  //     });
  //   };
  //   if (performer['ID'] !== oldCard.DEAL?.PERFORMER?.ID) {
  //     changesArr.push({
  //       id: newCard.ID,
  //       fieldName: 'Исполнитель',
  //       oldValue: oldCard.DEAL?.PERFORMER?.NAME,
  //       newValue: performer['NAME']
  //     });
  //   };
  //   if (newCard['USR$MASTERKEY'] !== oldCard.USR$MASTERKEY) {
  //     changesArr.push({
  //       id: newCard.ID,
  //       fieldName: 'Этап',
  //       oldValue: columns.find(column => column.ID === oldCard.USR$MASTERKEY)?.USR$NAME || '',
  //       newValue: columns.find(column => column.ID === newCard['USR$MASTERKEY'])?.USR$NAME || ''
  //     });
  //   };

  //   return changesArr;
  // };

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

      changes.current = compareCards(columns, newCard, oldCard);
    },
    handleDeleteCard: async (deletinCard: IKanbanCard) => {
      deleteCard(deletinCard.ID);
    },
    handleAddCard: async (newCard: IKanbanCard) => {
      changes.current.push({
        id: -1,
        fieldName: 'Сделка',
        oldValue: '',
        newValue: (newCard as any).DEAL.USR$NAME || ''
      });

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

        // setColumns(newColumns);
        changes.current.push({
          id: moveCard.ID,
          fieldName: 'Этап',
          oldValue: columns[Number(result.source.droppableId)].USR$NAME || '',
          newValue: columns[Number(result.destination.droppableId)].USR$NAME || ''
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

  const skeletonItems = useMemo(() =>(count:number):IKanbanColumn[] => {
    const skeletonFaqItems:IKanbanColumn[] = [];
    const skeletonFaqItem = {} as IKanbanColumn;
    for (let i = 0; i < count; i++) {
      skeletonFaqItems.push(
        { ...skeletonFaqItem, ID: -i - 1 }
      );
    }

    return skeletonFaqItems;
  }, []);

  const skeletonCount:IKanbanColumn[] = skeletonItems(5);

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
                  <Draggable key={column.ID || 1} draggableId={column.ID?.toString()} index={index}>
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
                                  onDelete={columnHandlers.handleTitleDelete}
                                  onAddCard={cardHandlers.handleAddCard}
                                  isFetching={isLoading}
                                >
                                  {column.CARDS
                                    ?.map((card, index) => {
                                      return (
                                        <Draggable key={card.ID + column.ID * 10} draggableId={(card.ID + column?.ID * 10)?.toString()} index={index}>
                                          {(provided, snapshot) => (
                                            <Box
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
