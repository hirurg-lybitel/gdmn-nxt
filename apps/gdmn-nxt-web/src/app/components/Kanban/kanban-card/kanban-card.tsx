import './kanban-card.module.less';
import { useDrag, useDrop} from 'react-dnd'
import { useRef, useState } from 'react';
import MainCard from '../../main-card/main-card';
import { Stack, Typography, useTheme } from '@mui/material';
import { ICard, IColumn } from '../../../pages/Dashboard/deals/deals';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';


/* eslint-disable-next-line */
export interface KanbanCardProps {
  card: ICard;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number, dragGroupIndex: any, hoverGroupIndex: any) => void;
  columns: IColumn[];
  onEdit: (card: ICard) => void;
  onDelete: (card: ICard) => void;
}

interface IItem {
  id: number;
  index: number;
  status: string;
}


export function KanbanCard(props: KanbanCardProps) {
  const { card, index, columns } = props;
  const { onEdit, onDelete, moveCard } = props;

  const myRef = useRef(null);
  const theme = useTheme();

  const [editCard, setEditCard] = useState(false);



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

  const cardHandlers = {
    handleSubmit: async (card: ICard, deleting: boolean) => {
      if (card.id <= 0) return;

      if (deleting) {
        onDelete(card);
        setEditCard(false);
        return;
      };

      onEdit(card);
      setEditCard(false);
    },
    handleCancel: async () => setEditCard(false),
  };

  return (
    <div ref={dropRef}>
      <MainCard
        border
        key={card.id}
        ref={dragRef}
        style={{
          opacity,
          height: 100,
          maxWidth: '10.4rem',
          textOverflow: "ellipsis",
          borderLeft: `solid ${theme.menu?.backgroundColor}`,
          padding: 5
        }}
        onDoubleClick={() => setEditCard(true)}
      >
        <Stack direction="column" spacing={1}>
          <Typography variant="h2">{card.title}</Typography>
          <Typography variant="caption" noWrap>{card.customer}</Typography>
          <Typography>{(Math.round((card.amount || 0) * 100)/100).toFixed(2)} Br</Typography>
        </Stack>
      </MainCard>
      {editCard &&
        <KanbanEditCard
          deal={card}
          currentStage={columns.find(column => column.id === card.status)}
          stages={columns}
          onSubmit={cardHandlers.handleSubmit}
          onCancelClick={cardHandlers.handleCancel}
        />}
    </div>
  );
}

export default KanbanCard;

