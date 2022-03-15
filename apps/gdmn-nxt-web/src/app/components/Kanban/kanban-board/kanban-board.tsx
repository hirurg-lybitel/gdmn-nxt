import './kanban-board.module.less';
import { Box, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import KanbanCard from '../kanban-card/kanban-card';
import KanbanColumn from '../kanban-column/kanban-column';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from "react-beautiful-dnd";
import { IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';
import { useAddCardMutation, useAddColumnMutation, useDeleteCardMutation, useDeleteColumnMutation, useReorderCardsMutation, useReorderColumnsMutation, useUpdateCardMutation, useUpdateColumnMutation } from '../../../features/kanban/kanbanApi';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

export interface KanbanBoardProps {
  columns: IKanbanColumn[];
};

export function KanbanBoard(props: KanbanBoardProps) {
  const { columns: inColumns } = props;

  const [columns, setColumns] = useState<IKanbanColumn[]>(inColumns)

  const [updateColumn] = useUpdateColumnMutation();
  const [addColumn] = useAddColumnMutation();
  const [deleteColumn] = useDeleteColumnMutation();
  const [reorderColumn] = useReorderColumnsMutation();

  const [addCard] = useAddCardMutation();
  const [updateCard] = useUpdateCardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [reorderCard] = useReorderCardsMutation();

  useEffect(()=>{
    setColumns(inColumns);
  }, [inColumns]);

  const columnHandlers = {
    handleTitleEdit: async (newColumn: IKanbanColumn) => {
      updateColumn(newColumn);
    },
    handleTitleDelete: async (column: IKanbanColumn) => {
      deleteColumn(column.ID)
    },
    handleAdd: async () => {
      const newColumn: IKanbanColumn = {
        ID: -1,
        USR$INDEX: columns.length + 1,
        USR$NAME: 'Новая группа',
        CARDS: []
      }
      addColumn(newColumn);
    }
  };

  const cardHandlers = {
    handleEditCard: async (newCard: IKanbanCard) => {
      updateCard(newCard);
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

  function onDragEnd(result: DropResult) {

    if (!result.destination) {
      return;
    };

    if ((result.type === 'board') && (result.destination.index === result.source.index)) {
      return;
    };

    let newColumns: IKanbanColumn[] = columns;

    if (result.type === 'board') {
      newColumns = reorder(
        columns,
        result.source.index,
        result.destination.index
      );

      newColumns = newColumns.map((el, index) => {
        return {...el, USR$INDEX: index}
      });

      setColumns(newColumns);
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
          return {...el, USR$INDEX: index}
        });

        newColumns = columns.map( (column, index) =>
          index === Number(result.source.droppableId) ? {...column, CARDS : newCards } : column
        );

        setColumns(newColumns);
        reorderCard(newCards);


      } else {
        /** перемещаем в другую колонку */
        const moveCard: IKanbanCard = {
          ...columns[Number(result.source.droppableId)].CARDS[result.source.index],
          USR$MASTERKEY: columns[Number(result.destination.droppableId)].ID,
          USR$INDEX: result.destination.index
        };

        newColumns = columns.map((column, index) => {
          const cards = [ ...column.CARDS ];
          let newCards = [...cards];
          switch (index) {
            case Number(result.source.droppableId):
              cards.splice(result.source.index, 1);
              newCards = cards.map((card, index) => ({...card, USR$INDEX: index}));

              reorderCard(newCards);
              break;

            case Number(result.destination!.droppableId):
              cards.splice(result.destination!.index, 0, moveCard);
              newCards = cards.map((card, index) => ({...card, USR$INDEX: index}));

              reorderCard(newCards);
              break;
          }
          return { ...column, CARDS: newCards };
        });

        setColumns(newColumns);
        updateCard(moveCard);
      }
    }
  }


  return (
    <PerfectScrollbar
      style={{
        display: 'flex'
      }}>
      <Box display="flex">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="board" direction='horizontal'>
            {(provided, snapshot) => (
                <Stack
                  direction="row"
                  spacing={2}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  display="flex"
                  overflow="auto"
                >
                {columns.map((column: IKanbanColumn, index) => (
                  <Draggable key={column.ID} draggableId={column.ID.toString()} index={index}>
                    {(provided, snapshot) => {
                      const dragProvided: DraggableProvided = provided;
                      const dragSnapshot = snapshot;
                      return (
                        <Box
                          aria-label='box1'
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          display="flex"
                        >
                          <Droppable key={index} droppableId={`${index}`} type="column">
                            {(provided, snapshot) => (
                              <Box
                                style={{display: 'flex'}}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                <KanbanColumn
                                  provided={dragProvided}
                                  dragSnapshot={dragSnapshot}
                                  dropSnapshot={snapshot}
                                  key={column.ID}
                                  item={column}
                                  columns={columns}
                                  onEdit={columnHandlers.handleTitleEdit}
                                  onDelete={columnHandlers.handleTitleDelete}
                                  onAddCard={cardHandlers.handleAddCard}
                                >
                                  {column.CARDS
                                    .map((card, index) => (
                                      <Draggable key={card.ID + column.ID*10} draggableId={(card.ID + column.ID*10).toString()} index={index}>
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
                                              onEdit={cardHandlers.handleEditCard}
                                              onDelete={cardHandlers.handleDeleteCard}
                                            />
                                          </Box>
                                        )}

                                      </Draggable>
                                    ))}
                                </KanbanColumn>
                              {/* {provided.placeholder} */}
                              </Box>
                            )}
                          </Droppable>
                        </Box>
                    )}}
                  </Draggable>
                ))}
                {provided.placeholder}
                <Box>
                  <Button onClick={columnHandlers.handleAdd} startIcon={<AddIcon/>}>Этап</Button>
                </Box>
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
        {/* <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%'
        }}>
          <CircularIndeterminate open={isLoading} size={100} />
        </div> */}
      </Box>
    </PerfectScrollbar>

  );
}

export default KanbanBoard;
