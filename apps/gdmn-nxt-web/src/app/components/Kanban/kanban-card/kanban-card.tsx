import './kanban-card.module.less';
import { useDrag, useDrop} from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useEffect, useRef } from 'react';
import MainCard from '../../main-card/main-card';
import { useTheme } from '@mui/material';
import { ICard } from '../../../pages/Dashboard/deals/deals';


/* eslint-disable-next-line */
export interface KanbanCardProps {
  card: ICard;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number, dragGroupIndex: any, hoverGroupIndex: any) => void;
}

interface IItem {
  id: number;
  index: number;
  status: string;
}


export function KanbanCard(props: KanbanCardProps) {
  const { card, index, moveCard } = props;

  const myRef = useRef(null);
  const theme = useTheme();



  const [{ canDrop, isOver, isDid }, dropRef] = useDrop(() => ({
    //accept: ['toDo', 'doing', 'done', 'error'].filter(el => el !== item.id),
    accept: ['card'],
    hover: (item: IItem, monitor) => {
      //if (it.index === index ) return;
      console.log('hover', card, index, item, monitor.getItem());

      moveCard(monitor.getItem().index, index, monitor.getItem().status, card.status);

      // console.log('mutable_index_before', monitor.getItem().index);
      //if (index > monitor.getItem().index ) return;
      //monitor.getItem().index = index;
      // console.log('mutable_index_after', monitor.getItem().index);
    },
    drop: (it, monitor) => {
      //console.log('drop_end', item, index, it.index, monitor.getItem());

      //moveCard((monitor.getItem() as {index: number}).index, index);
      //monitor.getItem().index = index;
      return monitor.getItem();
    },
    collect: (monitor) => ({
      isDid: monitor.didDrop(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  //console.log('isOver', isOver);
  //console.log('isDid', isDid);



  const [{ opacity }, dragRef] = useDrag(() => ({
    type: 'card',
    item: {
      id: card.id,
      index: index,
      status: card.status
    },
    end: (it, monitor) => {
      if (!monitor.didDrop()) return;

      //console.log('end', item, index, it.index, monitor.getItem(), monitor.getDropResult());

      //moveCard(index, (monitor.getItem() as {index: number}).index);

    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      canDrop: monitor.canDrag(),
      isOver: monitor.didDrop
    })
  }), []
  );

  return (
    <div ref={dropRef}>
    {/* <div ref={dragRef} style={{ backgroundColor: 'green', height: 200, width: 200 }}>{item.title}</div> */}
    <MainCard
      border
      key={card.id}
      ref={dragRef}
      style={{
        opacity,
        height: 100,
        borderLeft: `solid ${theme.menu?.backgroundColor}`,
        padding: 5
      }}
    >
      {card.title}
    </MainCard>
    </div>
  );
}

export default KanbanCard;

