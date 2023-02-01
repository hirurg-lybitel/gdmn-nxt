import './kanban-card.module.less';
import { useCallback, useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, CircularProgress, IconButton, Stack, Typography, useTheme } from '@mui/material';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableStateSnapshot } from 'react-beautiful-dnd';
import { IKanbanCard, IKanbanColumn, IKanbanTask } from '@gsbelarus/util-api-types';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';


/* eslint-disable-next-line */
export interface KanbanCardProps {
  snapshot: DraggableStateSnapshot;
  card: IKanbanCard;
  columns: IKanbanColumn[];
  onAdd: (card: IKanbanCard) => void;
  onEdit: (card: IKanbanCard) => void;
  onDelete: (card: IKanbanCard) => void;
};


export function KanbanCard(props: KanbanCardProps) {
  const { snapshot } = props;
  const { card, columns } = props;
  const { onAdd, onEdit, onDelete } = props;

  const theme = useTheme();
  const [editCard, setEditCard] = useState(false);
  const [copyCard, setCopyCard] = useState(false);

  const cardHandlers = {
    handleSubmit: async (card: IKanbanCard, deleting: boolean) => {
      if (!card.ID) {
        if (!copyCard) return;

        onAdd(card);

        copyCard && setCopyCard(false);

        return;
      };

      if (deleting) {
        onDelete(card);
        setEditCard(false);
        return;
      };

      onEdit(card);
      setEditCard(false);
    },
    handleCancel: async () => {
      editCard && setEditCard(false);
      copyCard && setCopyCard(false);
    },
    handleClose: async (e: any, reason: string) => {
      if (reason === 'backdropClick') setEditCard(false);
    },
  };

  const TaskStatus = useMemo(() => {
    const tasks = card.TASKS;
    if (!tasks || !tasks?.length) return <></>;

    const allTasks = tasks?.length;
    const closedTasks = tasks?.filter(task => task.USR$CLOSED).length;

    return (
      closedTasks
        ? <Stack direction="row" alignItems="center"spacing={0.5}>
          <Box sx={{ position: 'relative', display: 'flex' }}>
            <CircularProgress
              variant="determinate"
              size={15}
              thickness={7}
              value={100}
              sx={{
                color: (theme) =>
                  theme.palette.grey[200],
              }}
            />
            <CircularProgress
              variant="determinate"
              size={15}
              thickness={7}
              value={closedTasks / allTasks * 100}
              sx={{
                position: 'absolute',
                left: 0,
              }}
            />
          </Box>
          <Typography variant="caption">
            {`${closedTasks} из ${allTasks} задач`}
          </Typography>
        </Stack>
        : <Stack direction="row" alignItems="center" spacing={0.5}>
          <FactCheckOutlinedIcon color="action" fontSize="small" />
          <Typography variant="caption">
            {`${allTasks} задач`}
          </Typography>
        </Stack>
    );
  },
  [card]);

  const memoEditCard = useMemo(() => {
    return (
      <KanbanEditCard
        open={editCard}
        card={card}
        currentStage={columns.find(column => column.ID === card.USR$MASTERKEY)}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
        onClose={cardHandlers.handleClose}
      />
    );
  }, [editCard]);

  const memoCopyCard = useMemo(() => {
    return (
      <KanbanEditCard
        open={copyCard}
        card={{ ...card, ID: -1, DEAL: { ...card.DEAL, ID: -1, USR$NAME: '' } }}
        currentStage={columns.find(column => column.ID === card.USR$MASTERKEY)}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
        onClose={cardHandlers.handleClose}
      />
    );
  }, [copyCard]);

  const getDayDiff = useCallback((startDate: Date, endDate: Date) => {
    const msInDay = 24 * 60 * 60 * 1000;

    return Math.round(
      (startDate.getTime() - endDate.getTime()) / msInDay,
    );
  }, []);

  const doubleClick = useCallback(() => {
    onEdit({ ...card, USR$ISREAD: true });
    setEditCard(true);
  }, [card]);


  const memoCard = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 10);

    const dateDiff = getDayDiff(card.DEAL?.USR$DEADLINE ? new Date(card.DEAL.USR$DEADLINE) : tomorrow, today);

    return (
      <CustomizedCard
        borders
        key={card.ID}
        style={{
          width: '100%',
          textOverflow: 'ellipsis',
          padding: 5,
          ...(card?.USR$ISREAD || false
            ? {}
            : {
              backgroundColor: 'rgba(193, 228, 250, 0.5)',
              borderTop: '1px solid rgb(13, 228, 250)',
              borderBottom: '1px solid rgb(13, 228, 250)',
              borderRight: '1px solid rgb(13, 228, 250)',
            }),
          ...(snapshot.isDragging
            ? {
              opacity: 0.7,
              border: `solid ${theme.menu?.backgroundColor}`
            }
            : {
              borderLeft: `0.5rem solid ${
                (() => {
                  if (card.DEAL?.USR$DONE) return theme.menu?.backgroundColor;;
                  switch (true) {
                    case dateDiff <= 0:
                      return theme.color.red['A200'];
                    case dateDiff > 1:
                      return theme.menu?.backgroundColor;
                    case dateDiff > 0:
                    case dateDiff < 1:
                      return theme.color.yellow['A700'];
                    default:
                      return theme.menu?.backgroundColor;
                  }
                })()
              }`,
            }
          )
        }}
        sx={{
          '&:hover .actions': {
            display: 'inline',
            position: 'absolute',
            right: 0,
          }
        }}
        onDoubleClick={doubleClick}
      >
        <Stack direction="column" spacing={1}>
          <Stack
            direction="row"
            style={{ position: 'relative' }}
          >
            <Typography variant="h2" flex={1}>{card.DEAL?.USR$NAME}</Typography>
            <PermissionsGate actionCode={2}>
              {columns.find(column => column.ID === card.USR$MASTERKEY)?.USR$INDEX === 0
                ?
                <div
                  className="actions"
                  hidden
                >
                  <IconButton size="small" onClick={() => setCopyCard(true)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>
                : null}
            </PermissionsGate>
          </Stack>
          <Typography variant="caption" noWrap>{card.DEAL?.CONTACT?.NAME}</Typography>
          <Stack direction="row">
            <Typography>{(Math.round((card.DEAL?.USR$AMOUNT || 0) * 100) / 100).toFixed(2)} Br</Typography>
            <Box flex={1} />
            <Typography>
              {card.DEAL?.CREATIONDATE
                ? (new Date(card.DEAL.CREATIONDATE)).toLocaleString('default', { day: '2-digit', month: 'short' })
                : '-/-'}
            </Typography>
          </Stack>
          {TaskStatus}
        </Stack>
      </CustomizedCard>
    );
  }, [card, snapshot.isDragging]);

  return (
    <>
      {memoCard}
      {memoEditCard}
      {memoCopyCard}
    </>
  );

  return (
    <div>
      <CustomizedCard
        borders
        key={card.ID}
        style={{
          width: '100%',
          textOverflow: 'ellipsis',
          padding: 5,
          ...(snapshot.isDragging
            ? {
              opacity: 0.7,
              border: `solid ${theme.menu?.backgroundColor}`
            }
            : {
              borderLeft: `solid ${theme.menu?.backgroundColor}`,
            }
          )
        }}
        sx={{
          '&:hover .actions': {
            display: 'inline',
            position: 'absolute',
            right: 0,
          }
        }}
        onDoubleClick={() => setEditCard(true)}
      >
        <Stack direction="column" spacing={1}>
          <Stack
            direction="row"
            style={{ position: 'relative' }}
          >
            <Typography variant="h2" flex={1}>{card.DEAL?.USR$NAME}</Typography>
            <PermissionsGate actionCode={2}>
              {columns.find(column => column.ID === card.USR$MASTERKEY)?.USR$INDEX === 0
                ?
                <div
                  className="actions"
                  hidden
                >
                  <IconButton size="small" onClick={() => setCopyCard(true)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>
                : null}
            </PermissionsGate>
          </Stack>
          <Typography variant="caption" noWrap>{card.DEAL?.CONTACT?.NAME}</Typography>
          <Typography>{(Math.round((card.DEAL?.USR$AMOUNT || 0) * 100) / 100).toFixed(2)} Br</Typography>
          {TaskStatus}
        </Stack>
      </CustomizedCard>
      <KanbanEditCard
        open={editCard}
        card={card}
        currentStage={columns.find(column => column.ID === card.USR$MASTERKEY)}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
        onClose={cardHandlers.handleClose}
      />
      <KanbanEditCard
        open={copyCard}
        card={{ ...card, ID: -1, DEAL: { ...card.DEAL, ID: -1, USR$NAME: '' } }}
        currentStage={columns.find(column => column.ID === card.USR$MASTERKEY)}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
        onClose={cardHandlers.handleClose}
      />
    </div>
  );
}

export default KanbanCard;

