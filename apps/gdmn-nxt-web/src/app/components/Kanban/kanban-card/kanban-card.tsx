import './kanban-card.module.less';
import { useCallback, useMemo, useState } from 'react';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, IconButton, Stack, Typography, useTheme, Tooltip, Icon, useMediaQuery } from '@mui/material';
import KanbanEditCard from '../kanban-edit-card/kanban-edit-card';
import { DraggableStateSnapshot } from '@hello-pangea/dnd';
import { ColorMode, IKanbanCard, IKanbanColumn, IKanbanTask, Permissions } from '@gsbelarus/util-api-types';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import { useSetCardStatusMutation } from '../../../features/kanban/kanbanApi';
import { TaskStatus } from './task-status';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TodayIcon from '@mui/icons-material/Today';

export interface KanbanCardProps {
  snapshot: DraggableStateSnapshot;
  card: IKanbanCard;
  columns: IKanbanColumn[];
  onAdd: (card: IKanbanCard) => void;
  onEdit: (card: IKanbanCard) => void;
  onDelete: (card: IKanbanCard) => void;
  addIsFetching?: boolean;
  onAddTask: (task: IKanbanTask) => void;
  onEditTask: (task: IKanbanTask) => void;
  onDeleteTask: (task: IKanbanTask) => void;
};

export function KanbanCard(props: KanbanCardProps) {
  const { snapshot } = props;
  const { card, columns, addIsFetching } = props;
  const { onAdd, onEdit, onDelete, onAddTask, onEditTask, onDeleteTask } = props;
  const theme = useTheme();
  const userPermissions = useSelector<RootState, Permissions | undefined>(state => state.user.userProfile?.permissions);
  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);
  const colorModeIsLight = useMemo(() => colorMode === ColorMode.Light, [colorMode]);
  const [editCard, setEditCard] = useState(false);
  const [copyCard, setCopyCard] = useState(false);

  const [upsertCardStatus] = useSetCardStatusMutation();

  const deleteTasks = (newCard: IKanbanCard) => {
    const deletedTasks = card.TASKS?.filter(task => (newCard.TASKS?.findIndex(({ ID }) => ID === task.ID) ?? -1) < 0) ?? [];
    deletedTasks.forEach(task => onDeleteTask(task));
  };

  const upsertTasks = (newCard: IKanbanCard) => {
    newCard.TASKS?.forEach(task => {
      const oldTask = card.TASKS?.find(({ ID }) => ID === task.ID);
      if (!oldTask) {
        onAddTask({ ...task, ID: -1 });
        return;
      };

      if (JSON.stringify(task) !== JSON.stringify(oldTask)) {
        onEditTask(task);
      };
    });
  };

  const cardHandlers = {
    handleSubmit: (newCard: IKanbanCard, deleting: boolean) => {
      if (deleting) {
        onDelete(newCard);
        setEditCard(false);
        return;
      };

      if (newCard.ID && !deleting) {
        onEdit(newCard);
        copyCard && setCopyCard(false);
        setEditCard(false);

        deleteTasks(newCard);
        upsertTasks(newCard);
      } else {
        onAdd(newCard);
        copyCard && setCopyCard(false);
      }
    },
    handleCancel: async (newCard: IKanbanCard) => {
      editCard && setEditCard(false);
      copyCard && setCopyCard(false);
      if (newCard.ID > 0) {
        deleteTasks(newCard);
        upsertTasks(newCard);
      }
    },
  };

  const handleCopyCard = useCallback(() => setCopyCard(true), []);

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
        card={{
          ID: -1,
          USR$INDEX: 0,
          USR$MASTERKEY: 0,
          DEAL: {
            ID: -1,
            CONTACT: card?.DEAL?.CONTACT,
            SOURCE: card?.DEAL?.SOURCE,
            USR$AMOUNT: card?.DEAL?.USR$AMOUNT,
            USR$DEADLINE: card?.DEAL?.USR$DEADLINE,
            DEPARTMENT: card?.DEAL?.DEPARTMENT,
            PERFORMERS: card?.DEAL?.PERFORMERS,
            PRODUCTNAME: card?.DEAL?.PRODUCTNAME,
            REQUESTNUMBER: card?.DEAL?.REQUESTNUMBER,
            CONTACT_NAME: card?.DEAL?.CONTACT_NAME,
            CONTACT_EMAIL: card?.DEAL?.CONTACT_EMAIL,
            CONTACT_PHONE: card?.DEAL?.CONTACT_PHONE,
          },
        }}
        currentStage={columns.find(column => column.ID === card.USR$MASTERKEY)}
        stages={columns}
        onSubmit={cardHandlers.handleSubmit}
        onCancelClick={cardHandlers.handleCancel}
      />
    );
  }, [copyCard]);

  const getDayDiff = useCallback((startDate: Date, endDate: Date) => {
    const msInDay = 24 * 60 * 60 * 1000;

    return Math.round(
      (startDate.getTime() - endDate.getTime()) / msInDay,
    );
  }, []);

  const userId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.id);
  const contactId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.contactkey);

  const doubleClick = useCallback(() => {
    const isPerformer = card.DEAL?.PERFORMERS?.some(performer => performer.ID === contactId);
    const isCreator = card.DEAL?.CREATOR?.ID === contactId;

    if (!card.STATUS?.isRead && (isCreator || isPerformer)) {
      upsertCardStatus({
        isRead: true,
        userId,
        cardId: card.ID
      });
    }
    setEditCard(true);
  }, [card]);

  const [lastTap, setLastTap] = useState(0);

  const onCardClick = useCallback(() => {
    const currentTime = Date.now();
    const tapGap = currentTime - lastTap;

    if (tapGap < 500) {
      doubleClick();
      setLastTap(currentTime - 500);
      return;
    }

    setLastTap(currentTime);
  }, [doubleClick, lastTap]);

  const mobile = useMediaQuery('(pointer: coarse)');

  const dayCalc = (days: number): string => {
    const positiveDays = Math.abs(days);
    const lastNumber = positiveDays % 10;
    const preLast = positiveDays % 100;
    if (preLast >= 5 && preLast <= 20) return 'дней';
    if (lastNumber === 1) {
      return 'день';
    }
    if (lastNumber >= 2 && lastNumber <= 4) {
      return 'дня';
    }
    if (lastNumber >= 5 || lastNumber === 0) {
      return 'дней';
    }
    return '';
  };
  const dayColor = (days: number, baseColor?: string): string => {
    if (days === 1) return 'darkorange';
    if (days <= 0) return 'rgb(255, 82, 82)';
    return 'unset';
  };

  const deadLine = useMemo(() => {
    if (!card.DEAL?.USR$DEADLINE) return null;
    const deadline = Number(Math.ceil((new Date(card.DEAL?.USR$DEADLINE).getTime() - new Date().valueOf()) / (1000 * 60 * 60 * 24)) + '');
    const isLastColumn = card.USR$MASTERKEY === columns.at(-1)?.ID;

    return (
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">
          {'Срок: '}
          {card.DEAL?.USR$DEADLINE
            ? (new Date(card.DEAL.USR$DEADLINE)).toLocaleString('default', { day: '2-digit', month: 'short', year: '2-digit' })
            : '-/-'}
        </Typography>
        {isLastColumn ?
          <></> :
          <>
            <Box flex={1} />
            <Typography
              variant="body2"
              style={{ color: dayColor(deadline) }}
            >
              {deadline === 0 ? 'Сегодня' : Math.abs(deadline) + ' ' + dayCalc(deadline)}
            </Typography>
            <Tooltip title={deadline >= 0 ? 'Дней осталось' : 'Дней просрочено'} arrow>
              <AccessTimeIcon />
            </Tooltip>
          </>
        }

      </Stack>
    );
  }, [card, colorModeIsLight]);

  const memoCard = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 10);

    const dateDiff = getDayDiff(card.DEAL?.USR$DEADLINE ? new Date(card.DEAL.USR$DEADLINE) : tomorrow, today);

    const isFirstColumn = columns.find(column => column.ID === card.USR$MASTERKEY)?.USR$INDEX === 0;
    return (
      <CustomizedCard
        borders={colorMode === ColorMode.Light}
        key={card.ID}
        style={{
          width: '100%',
          textOverflow: 'ellipsis',
          padding: 5,
          touchAction: 'manipulation',
          backgroundColor: 'var(--color-card-bg)',
          ...(card?.STATUS &&
            'isRead' in (card?.STATUS ?? {}) &&
            !card?.STATUS?.isRead
            ? {
              backgroundColor: 'rgba(193, 228, 250, 0.25)',
              borderTop: '1px solid rgb(13, 228, 250)',
              borderBottom: '1px solid rgb(13, 228, 250)',
              borderRight: '1px solid rgb(13, 228, 250)',
            }
            : {}),
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
          '&:hover .actions': mobile ? {} : {
            display: 'inline',
            position: 'absolute',
            right: 0,
          },
          '&:hover .number': mobile ? {} : {
            opacity: 0, visibility: 'hidden'
          },
          '&:hover': {
            boxShadow: '0 4px 18px rgba(0,0,0,.3)'
          }
        }}
      >
        <Stack
          direction="column"
          spacing={0.5}
          color={colorModeIsLight ? '#636b74' : '#bababa'}
          style={{ touchAction: 'manipulation' }}
          onDoubleClick={doubleClick}
          onClick={mobile ? onCardClick : undefined}
        >
          <Stack
            direction="row"
            style={{ position: 'relative' }}
            spacing={1}
          >
            <Typography
              variant="subtitle1"
              flex={1}
              lineHeight="1.2em"
              fontWeight={400}
              maxWidth={280}
            >
              {card.DEAL?.USR$NAME}
            </Typography>
            {isFirstColumn
              ?
              <PermissionsGate actionAllowed={userPermissions?.deals.COPY}>
                <div
                  className="actions"
                  hidden={!mobile}
                >
                  <IconButton
                    size="small"
                    disabled={addIsFetching}
                    onClick={handleCopyCard}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </div>
              </PermissionsGate>
              : null
            }
            <Typography
              className="number"
              variant="caption"
            >
              {'#' + card.DEAL?.USR$NUMBER}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography variant="body2" noWrap>{card.DEAL?.CONTACT?.NAME}</Typography>
            <Box flex={1} />
            {
              card.DEAL?.PREPAID &&
              <Tooltip title={'Предоплачено'} arrow>
                <Icon
                  fontSize="small"
                  color={'success'}
                  style={{ marginTop: '-4px', height: '22px' }}
                >
                  <PaidOutlinedIcon fontSize="small" />
                </Icon>
              </Tooltip>
            }
          </Stack>
          {deadLine}
          <Stack direction="row" spacing={0.5}>
            {(card.DEAL?.USR$AMOUNT || 0) > 0 &&
              <Typography variant="body2">
                {(Math.round((card.DEAL?.USR$AMOUNT || 0) * 100) / 100).toFixed(2)} Br
              </Typography>
            }
          </Stack>
        </Stack>
        <Stack
          direction="row"
          spacing={0.5}
          position="relative"
          minHeight={20}
          color={colorModeIsLight ? '#636b74' : '#bababa'}
        >
          <TaskStatus tasks={card.TASKS ?? []} />

          <Stack
            direction={'row'}
            spacing={0.5}
            position="absolute"
            right={0}
          >
            <Typography variant="body2">
              {card.DEAL?.CREATIONDATE
                ? (new Date(card.DEAL.CREATIONDATE)).toLocaleString('default', { day: '2-digit', month: 'short' })
                : '-/-'}
            </Typography>
            <Tooltip title={'Дата создания'} arrow>
              <TodayIcon />
            </Tooltip>
          </Stack>
        </Stack>
      </CustomizedCard>
    );
  }, [card, snapshot.isDragging, addIsFetching, theme, onCardClick, mobile]);

  return (
    <>
      {memoCard}
      {memoEditCard}
      {memoCopyCard}
    </>
  );
}

export default KanbanCard;

