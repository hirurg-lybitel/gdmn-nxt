import './kanban-board.module.less';
import { Flipper, Flipped } from "react-flip-toolkit";
import { Box, Button, Card, Stack } from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useEffect, useState } from 'react';
import { arrayMoveImmutable } from "array-move";
import KanbanCard from '../kanban-card/kanban-card';
import { IColumn, ICard } from '../../../pages/Dashboard/deals/deals'
import KanbanColumn from '../kanban-column/kanban-column';
import AddIcon from '@mui/icons-material/Add';


export interface KanbanBoardProps {
  columns: IColumn[];
  cards: ICard[];
}

export function KanbanBoard(props: KanbanBoardProps) {
  const { columns: inColumns, cards } = props;

  const [flipId, setFlipId] = useState(inColumns.map(column => column.id).join(''));
  const [columns, setColumns] = useState<IColumn[]>([]);
  //const [cards, setCards] = useState<ICard[]>(inCards);
  //let flipId = '';

  useEffect(() => {
    setColumns(inColumns);
  }, [])

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    //console.log('moveGroup', dragIndex, hoverIndex);
    if (dragIndex === hoverIndex) {
      console.log('moveGroup1', dragIndex, hoverIndex);

    } else {
      console.log('moveGroup', dragIndex, hoverIndex);
      const newArr = arrayMoveImmutable(columns, dragIndex, hoverIndex);
      setColumns(newArr);
      //setFlipId(newArr.map(column => column.id).join(''));
    }
  };

  const moveCard = (dragIndex: number, hoverIndex: number, dragGroup: any, hoverGroup: any) => {
    const dragGroupIndex = columns.findIndex(column => column.id === dragGroup);
    const hoverGroupIndex = columns.findIndex(column => column.id === hoverGroup)

    console.log('moveCard', dragIndex, hoverIndex, dragGroupIndex, hoverGroupIndex);

    if (dragGroupIndex === hoverGroupIndex) {

    } else {
      const dragCard = cards[dragIndex];

      console.log('dragCard', dragCard);

    }

  };

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

  useEffect(() => {
    setFlipId(columns.map(column => column.id).join(''));
  }, [columns])

  // columns.forEach((column) => {
  //   flipId += cards.filter(card => card.status === column.id).map(card => card.id).join('') ;
  // });

  const handleAdd = () => {
    const newColumn: IColumn = {
      id: columns.length + 1,
      title: 'Новая группа',
      cards: []
    }

    const newArr = [...columns];
    newArr.push(newColumn);
    setColumns(newArr);

    //setFlipId(columns.map(column => column.id).join(''));

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

  return (
    <DndProvider backend={HTML5Backend}>
      <Flipper flipKey={flipId} >
        <Stack direction="row" spacing={2}>
          {columns.map((column, index) => (
            <Flipped key={column.id} flipId={column.id}>
              <KanbanColumn
                key={column.id}
                item={column}
                columns={columns}
                index={index}
                moveCard={moveColumn}
                onEdit={handleTitleEdit}
                onDelete={handleTitleDelete}
                onAddCard={handleAddCard}
              >
                {column.cards
                  .map((card, index) => (
                    <Flipped key={card.id} flipId={card.id}>
                      <KanbanCard
                        key={card.id}
                        index={index}
                        card={card}
                        columns={columns}
                        moveCard={moveCard}
                        onEdit={cardHandlers.handleEditCard}
                        onDelete={cardHandlers.handleDeleteCard}
                      />
                    </Flipped>
                  ))}

              </KanbanColumn>
              </Flipped>
            ))}
            <Box>
              <Button onClick={handleAdd} startIcon={<AddIcon/>}>Группа</Button>
            </Box>
        </Stack>
      </Flipper>
    </DndProvider>
  );
}

export default KanbanBoard;
