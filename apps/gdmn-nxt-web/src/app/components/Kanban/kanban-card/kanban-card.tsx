import './kanban-card.module.less';
import { useState } from 'react';
import MainCard from '../../main-card/main-card';
import { Stack, Typography, useTheme } from '@mui/material';
import { ICard, IColumn } from '../../../pages/Dashboard/deals/deals';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableStateSnapshot } from 'react-beautiful-dnd';


/* eslint-disable-next-line */
export interface KanbanCardProps {
  snapshot: DraggableStateSnapshot;
  card: ICard;
  columns: IColumn[];
  onEdit: (card: ICard) => void;
  onDelete: (card: ICard) => void;
}


export function KanbanCard(props: KanbanCardProps) {
  const { snapshot } = props;
  const { card, columns } = props;
  const { onEdit, onDelete } = props;

  const theme = useTheme();
  const [editCard, setEditCard] = useState(false);

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
    <div>
      <MainCard
        borders
        key={card.id}
        style={{
          width: '100%',
          textOverflow: "ellipsis",
          padding: 5,
          ...(snapshot.isDragging
            ? {
              opacity: 0.7,
              border: `solid ${theme.menu?.backgroundColor}`
            }
            : {
              borderLeft: `solid ${theme.menu?.backgroundColor}`,
            })
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

