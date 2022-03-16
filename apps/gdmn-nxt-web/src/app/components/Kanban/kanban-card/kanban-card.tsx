import './kanban-card.module.less';
import { useState } from 'react';
import CustomizedCard from '../../customized-card/customized-card';
import { Stack, Typography, useTheme } from '@mui/material';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableStateSnapshot } from 'react-beautiful-dnd';
import { IKanbanCard, IKanbanColumn } from '@gsbelarus/util-api-types';


/* eslint-disable-next-line */
export interface KanbanCardProps {
  snapshot: DraggableStateSnapshot;
  card: IKanbanCard;
  columns: IKanbanColumn[];
  onEdit: (card: IKanbanCard) => void;
  onDelete: (card: IKanbanCard) => void;
}


export function KanbanCard(props: KanbanCardProps) {
  const { snapshot } = props;
  const { card, columns } = props;
  const { onEdit, onDelete } = props;

  const theme = useTheme();
  const [editCard, setEditCard] = useState(false);

  const cardHandlers = {
    handleSubmit: async (card: IKanbanCard, deleting: boolean) => {
      if (card.ID <= 0) return;

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
      <CustomizedCard
        borders
        key={card.ID}
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
          <Typography variant="h2">{card.DEAL?.USR$NAME}</Typography>
          <Typography variant="caption" noWrap>{card.DEAL?.CONTACT?.NAME}</Typography>
          <Typography>{(Math.round((card.DEAL?.USR$AMOUNT || 0) * 100)/100).toFixed(2)} Br</Typography>
        </Stack>
      </CustomizedCard>
      {editCard &&
        <KanbanEditCard
          card={card}
          currentStage={columns.find(column => column.ID === card.USR$MASTERKEY)}
          stages={columns}
          onSubmit={cardHandlers.handleSubmit}
          onCancelClick={cardHandlers.handleCancel}
        />}
    </div>
  );
}

export default KanbanCard;

