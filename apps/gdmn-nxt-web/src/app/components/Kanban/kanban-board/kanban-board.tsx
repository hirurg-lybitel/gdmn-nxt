import './kanban-board.module.less';
import { Box, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import KanbanCard from '../kanban-card/kanban-card';
import { IColumn, ICard } from '../../../pages/Dashboard/deals/deals'
import KanbanColumn from '../kanban-column/kanban-column';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided } from "react-beautiful-dnd";


export interface KanbanBoardProps {
  columns: IColumn[];
  cards: ICard[];
}

export function KanbanBoard(props: KanbanBoardProps) {
  const { columns: inColumns, cards } = props;

  const [columns, setColumns] = useState<IColumn[]>([]);

  useEffect(() => {
    setColumns(inColumns);
  }, [])

  const handleTitleEdit = (newColumn: IColumn) => {
    const newColumns = columns.map(column => column.id === newColumn.id ? newColumn : column);
    setColumns(newColumns);
  };

  const handleTitleDelete = (column: IColumn) => {

    const newColumns = [...columns];
    newColumns.splice(columns.indexOf(column), 1);
    setColumns(newColumns);
  };


  const handleAddCard = (newCard: ICard) => {
    newCard.id = newCard.status * 10 + columns.find(el => el.id === newCard.status)!.cards.length + 1

    const newColumns = [...columns];
    newColumns.find(el => el.id === newCard.status)?.cards.push(newCard)
    setColumns(newColumns);
  };


  const handleAdd = () => {
    const newColumn: IColumn = {
      id: columns.length + 1,
      title: 'Новая группа',
      cards: []
    }

    const newArr = [...columns];
    newArr.push(newColumn);
    setColumns(newArr);

  }

  const cardHandlers = {
    handleEditCard: async (newCard: ICard) => {
      console.log('handleEditCard', newCard);
      console.log('handleEditCard', columns);
      const newColumns =
        columns
          .map(column => {
            /** если в карте поменялся родитель */
            const newCardIndex = column.cards.findIndex(card => card.id === newCard.id);

            if ((column.id === newCard.status) && (newCardIndex < 0)) {
              column.cards.push(newCard);
              return {...column}
            };

            if ((column.id !== newCard.status) && (newCardIndex >= 0)) {
              column.cards.splice(newCardIndex, 1);
              return {...column}
            };

            return {...column, cards: column.cards.map(card => card.id === newCard.id ? {...card, ...newCard} : card)}
        })

      setColumns(newColumns);
    },
    handleDeleteCard: async (deletinCard: ICard) => {
      const newColumns =
        columns
          .map(column => {
            const indexCard = column.cards.findIndex(card => card.id === deletinCard.id);
            if (indexCard > 0) column.cards.splice(column.cards.indexOf(deletinCard), 1);
            return {...column}
            }
          );
      setColumns(newColumns);
    },
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
    }

    if ((result.type === 'board') && (result.destination.index === result.source.index)) {
      return;
    }

    let newColumns: IColumn[] = columns;

    if (result.type === 'board') {
      newColumns = reorder(
        columns,
        result.source.index,
        result.destination.index
      );
    }

    if (result.type === 'column') {
      /** если перемешаем внутри одной колонки */
      if (result.destination.droppableId === result.source.droppableId) {
        const newCards = reorder(
          columns[Number(result.source.droppableId)].cards,
          result.source.index,
          result.destination.index
        );

        newColumns = [...columns];
        newColumns[Number(result.source.droppableId)].cards = newCards;
      } else {
        /** перемещаем в другую колонку */
        newColumns = [...columns];
        const [removedCard] = newColumns[Number(result.source.droppableId)].cards.splice(result.source.index, 1);
        newColumns[Number(result.destination.droppableId)].cards.splice(result.destination.index, 0, removedCard);
      }
    }

    setColumns(newColumns);
  }


  return (
    <Box style={{ display: 'flex' }}>
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
              {columns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id.toString()} index={index}>
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
                                key={column.id}
                                item={column}
                                columns={columns}
                                onEdit={handleTitleEdit}
                                onDelete={handleTitleDelete}
                                onAddCard={handleAddCard}
                              >
                                {column.cards
                                  .map((card, index) => (
                                    <Draggable key={card.id + column.id*10} draggableId={(card.id + column.id*10).toString()} index={index}>
                                      {(provided, snapshot) => (
                                        <Box
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <KanbanCard
                                            snapshot={snapshot}
                                            key={card.id}
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
                <Button onClick={handleAdd} startIcon={<AddIcon/>}>Группа</Button>
              </Box>
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Box>

  );
}

export default KanbanBoard;
