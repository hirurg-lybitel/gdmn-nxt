import './kanban-card.module.less';
import { useCallback, useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, CircularProgress, IconButton, Stack, Typography, useTheme } from '@mui/material';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableStateSnapshot } from '@hello-pangea/dnd';
import { ColorMode, IKanbanCard, IKanbanColumn, Permissions } from '@gsbelarus/util-api-types';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';


/* eslint-disable-next-line */
export interface KanbanCardProps {
  snapshot: DraggableStateSnapshot;
  card: IKanbanCard;
  columns: IKanbanColumn[];
  onAdd: (card: IKanbanCard) => void;
  onEdit: (card: IKanbanCard) => void;
  onDelete: (card: IKanbanCard) => void;
  addIsFetching?: boolean;
  lastCard?: IKanbanCard
  clearLastCard: (isAdd?: boolean) => void
};


export function KanbanCard(props: KanbanCardProps) {
  const { snapshot } = props;
  const { card, columns, lastCard, addIsFetching } = props;
  const { onAdd, onEdit, onDelete, clearLastCard } = props;
  const theme = useTheme();
  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);
  const [editCard, setEditCard] = useState(false);
  const [copyCard, setCopyCard] = useState(false);

  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);

  const cardHandlers = {
    handleSubmit: async (card: IKanbanCard, deleting: boolean, close?: boolean) => {
      if (deleting) {
        onDelete(card);
        setEditCard(false);
        return;
      };
      if (card.ID && !deleting) {
        onEdit(card);
        copyCard && setCopyCard(false);
        setEditCard(false);
        clearLastCard();
        return;
      } else {
        onAdd(card);
        if (close || close === undefined) {
          copyCard && setCopyCard(false);
          clearLastCard(true);
        }
        return;
      }
    },
    handleCancel: async (isFetching?: boolean) => {
      clearLastCard(isFetching);
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
      />
    );
  }, [editCard]);

  const memoCopyCard = useMemo(() => {
    return (
      <KanbanEditCard
        open={copyCard}
        card={lastCard || { ...card, ID: -1, DEAL: { ...card.DEAL, ID: -1, USR$NAME: undefined } }}
        currentStage={columns.find(column => column.ID === card.USR$MASTERKEY)}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
      />
    );
  }, [copyCard, lastCard]);

  const getDayDiff = useCallback((startDate: Date, endDate: Date) => {
    const msInDay = 24 * 60 * 60 * 1000;

    return Math.round(
      (startDate.getTime() - endDate.getTime()) / msInDay,
    );
  }, []);

  const doubleClick = useCallback(() => {
    if (!card.USR$ISREAD) onEdit({ ...card, USR$ISREAD: true });
    setEditCard(true);
  }, [card]);

  const dayCalc = (days: number): string => {
    const positiveDays = Math.abs(days);
    const lastNumber = positiveDays % 10;
    const preLast = positiveDays % 100;
    if (preLast >= 5 && preLast <= 20) return 'Дней';
    if (lastNumber === 1) {
      return 'День';
    }
    if (lastNumber >= 2 && lastNumber <= 4) {
      return 'Дня';
    }
    if (lastNumber >= 5 || lastNumber === 0) {
      return 'Дней';
    }
    return '';
  };

  const deadLine = useMemo(() => {
    const dayColor = (days: number): string => {
      if (days === 1) return 'rgb(255, 214, 0)';
      if (days <= 0) return 'rgb(255, 82, 82)';
      return 'white';
    };

    if (!card.DEAL?.USR$DEADLINE) return null;
    const deadline = Number(Math.ceil((new Date(card.DEAL?.USR$DEADLINE).getTime() - new Date().valueOf()) / (1000 * 60 * 60 * 24)));
    return (
      <Stack direction="row">
        <Typography>
          {'Срок: '}
          {card.DEAL?.USR$DEADLINE
            ? (new Date(card.DEAL.USR$DEADLINE)).toLocaleString('default', { day: '2-digit', month: 'short' })
            : '-/-'}
        </Typography>
        <Box flex={1} />
        <Typography style={{ color: dayColor(deadline) }}>
          {
            Math.abs(deadline)
          }
          {
            ' ' + dayCalc(deadline)
          }
        </Typography>
      </Stack>
    );
  }, [card]);

  const memoCard = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 10);

    const dateDiff = getDayDiff(card.DEAL?.USR$DEADLINE ? new Date(card.DEAL.USR$DEADLINE) : tomorrow, today);


    return (
      <CustomizedCard
        borders={colorMode === ColorMode.Light}
        // boxShadows
        key={card.ID}
        style={{
          width: '100%',
          textOverflow: 'ellipsis',
          padding: 5,
          backgroundColor: colorMode === ColorMode.Light ? 'whitesmoke' : 'dimgrey',
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
                  if (card.DEAL?.USR$DONE) return theme.palette.primary.main;
                  switch (true) {
                    case dateDiff <= 0:
                      return theme.color.red.A200;
                    case dateDiff > 1:
                      return theme.palette.primary.main;
                    case dateDiff > 0:
                    case dateDiff < 1:
                      return theme.color.yellow.A700;
                    default:
                      return theme.palette.primary.main;
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
          },
          '&:hover .number': {
            display: 'none',
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
            <Typography className="number" variant="caption" color="GrayText">{'#' + card.DEAL?.USR$NUMBER}</Typography>
            {columns.find(column => column.ID === card.USR$MASTERKEY)?.USR$INDEX === 0
              ?
              <PermissionsGate actionAllowed={userPermissions?.deals.COPY}>
                <div
                  className="actions"
                  hidden
                >
                  <IconButton size="small" disabled={addIsFetching} onClick={() => setCopyCard(true)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>
              </PermissionsGate>
              : null
            }
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
          {deadLine}
          {TaskStatus}
        </Stack>
      </CustomizedCard>
    );
  }, [card, snapshot.isDragging, addIsFetching]);

  return (
    <>
      {memoCard}
      {memoEditCard}
      {memoCopyCard}
    </>
  );
}

export default KanbanCard;

