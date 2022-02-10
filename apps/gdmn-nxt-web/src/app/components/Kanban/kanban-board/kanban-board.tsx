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

    console.log('moveCard', dragGroupIndex, hoverGroupIndex)

    if (dragGroupIndex === hoverGroupIndex) {

    } else {
      const dragCard = cards[dragIndex];

      console.log('dragCard', dragCard);

    }

  };

  useEffect(() => {
    console.log('columns', columns);
    setFlipId(columns.map(column => column.id).join(''));
  }, [columns])

  // columns.forEach((column) => {
  //   flipId += cards.filter(card => card.status === column.id).map(card => card.id).join('') ;
  // });

  const handleAdd = () => {
    const newColumn: IColumn = {
      id: columns.length + 1,
      title: 'Новая группа',
    }

    const newArr = [...columns];
    newArr.push(newColumn);
    setColumns(newArr);
    //setFlipId(columns.map(column => column.id).join(''));


  }

  console.log('KanbanBoard');

  return (
    <DndProvider backend={HTML5Backend}>
      {/* <Stack direction="row" spacing={4}>
        {columns.map((el, index) => (<div>{el.title}-{index}</div>))}
      </Stack> */}
      <Flipper flipKey={flipId} >
        <Stack direction="row" spacing={2}>
          {columns.map((column, index) => (
            <Flipped key={column.id} flipId={column.id}>
              <KanbanColumn
                key={column.id}
                item={column}
                index={index}
                moveCard={moveColumn}
              >
                {cards
                  .filter(card => card.status === column.id)
                  .map((card, index) => (
                    <Flipped key={card.id} flipId={card.id}>
                      <KanbanCard
                        key={card.id}
                        index={index}
                        card={card}
                        moveCard={moveCard}
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
