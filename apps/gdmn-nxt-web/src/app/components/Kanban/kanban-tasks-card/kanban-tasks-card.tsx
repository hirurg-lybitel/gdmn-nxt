import { useCallback, useMemo, useState } from 'react';
import styles from './kanban-tasks-card.module.less';
import { ColorMode, IKanbanCard, IKanbanTask } from '@gsbelarus/util-api-types';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { Box, Icon, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KanbanEditTask from '../kanban-edit-task/kanban-edit-task';
import { useAddTaskMutation, useDeleteTaskMutation, useSetCardStatusMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import useTruncate from '@gdmn-nxt/helpers/hooks/useTruncate';
import PermissionsGate from '../../Permissions/permission-gate/permission-gate';
import usePermissions from '@gdmn-nxt/helpers/hooks/usePermissions';
import ForwardIcon from '@mui/icons-material/Forward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export interface KanbanTasksCardProps {
  card: IKanbanCard;
}

export function KanbanTasksCard(props: KanbanTasksCardProps) {
  const { card } = props;

  const truncate = useTruncate();
  const [openEditForm, setOpenEditForm] = useState(false);
  const [addTask, { isSuccess: addedTaskSuccess, data: addedTask }] = useAddTaskMutation();
  const [updateTask, { isSuccess: updatedTaskSuccess }] = useUpdateTaskMutation();
  const [deleteTask, { isSuccess: deletedTaskSuccess }] = useDeleteTaskMutation();
  const [upsertCardStatus] = useSetCardStatusMutation();

  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);
  const userId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.id);
  const contactId = useSelector<RootState, number | undefined>(state => state.user.userProfile?.contactkey);

  const userPermissions = usePermissions();

  const colorModeIsLight = useMemo(() => colorMode === ColorMode.Light, [colorMode]);

  const handleTaskEditSubmit = useCallback((task: IKanbanTask, deleting: boolean) => {
    const newTask: IKanbanTask = {
      ...task,
      USR$CARDKEY: card?.ID || -1
    };

    if (deleting) {
      deleteTask(newTask.ID);
      setOpenEditForm(false);
      return;
    };

    if (newTask.ID > 0) {
      updateTask(newTask);
      setOpenEditForm(false);
      return;
    };

    addTask(newTask);
    setOpenEditForm(false);
  }, []);

  const doubleClick = useCallback(() => {
    setOpenEditForm(true);

    const isPerformer = card.TASK?.PERFORMER?.ID === contactId;
    const isCreator = card.TASK?.CREATOR?.ID === contactId;

    if (!card.STATUS?.isRead && (isCreator || isPerformer)) {
      upsertCardStatus({
        isRead: true,
        userId,
        cardId: card.TASK!.ID
      });
    }
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

  const handleTaskEditCancelClick = useCallback(() => setOpenEditForm(false), []);

  const memoKanbanEditTask = useMemo(() =>
    <KanbanEditTask
      open={openEditForm}
      task={card.TASK}
      onSubmit={handleTaskEditSubmit}
      onCancelClick={handleTaskEditCancelClick}
    />,
  [openEditForm]);

  const getDayFrom = (msec: Date): number => Math.ceil((msec.getTime() / (1000 * 60 * 60 * 24)));

  return (
    <>
      <CustomizedCard
        onDoubleClick={doubleClick}
        onClick={mobile ? onCardClick : undefined}
        style={{
          touchAction: 'manipulation',
          backgroundColor: 'var(--color-card-bg)',
          padding: '12px',
          cursor: 'pointer',
          color: colorModeIsLight ? '#636b74' : '#bababa',
          ...(card?.STATUS &&
            ('isRead' in (card?.STATUS ?? {})) &&
            !card?.STATUS?.isRead
            ? {
              backgroundColor: 'rgba(193, 228, 250, 0.25)',
              border: '1px solid rgb(13, 228, 250)',
            }
            : {}),
        }}
        sx={{
          '&:hover': {
            boxShadow: '0 4px 18px rgba(0,0,0,.3)'
          }
        }}
      >
        <Stack spacing={0.5}>
          <Stack
            direction="row"
            style={{ justifyContent: 'space-between', lineHeight: '.4em' }}
          >
            <Typography
              variant="body2"
              component="span"
            >
              {card.DEAL?.CONTACT?.NAME}
            </Typography>
            <Typography
              className="number"
              variant="caption"
            >
              {'#' + card.TASK?.USR$NUMBER}
            </Typography>
          </Stack>
          <Typography
            variant="subtitle1"
            lineHeight="1.2em"
            fontWeight={400}
            color="primary"
          >
            {card.DEAL?.USR$NAME}
          </Typography>
          <Tooltip
            title={'Срок выполнения'}
            placement="bottom-start"
          >
            <Typography
              variant="subtitle2"
              color={colorModeIsLight ? 'GrayText' : 'lightgray'}
              style={card.TASK?.USR$DEADLINE && (new Date(card.TASK?.USR$DEADLINE) < new Date()
                ? { color: colorModeIsLight ? 'red' : 'rgb(254, 115, 105)' }
                : getDayFrom(new Date(card.TASK?.USR$DEADLINE)) === getDayFrom(new Date())
                  ? { color: 'orange' }
                  : {})}
            >
              {card.TASK?.USR$DEADLINE
                ? (new Date(card.TASK?.USR$DEADLINE)).toLocaleString('default',
                  {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    ...((new Date(card.TASK?.USR$DEADLINE).getHours() !== 0) && { hour: '2-digit', minute: '2-digit' }) })
                : '-/-'}
            </Typography>
          </Tooltip>
          {(!!card.TASK?.PERFORMER?.NAME || !!card.TASK?.CREATOR?.NAME) &&
          <Stack
            direction="row"
            display="inline-flex"
            alignItems="center"
            spacing={0.5}
            ml={-0.2}
          >
            <AccountCircleIcon color="primary" fontSize="small" />
            <Typography variant="body2">
              {
                card.TASK?.CREATOR?.NAME
                  .split(' ')
                  .map((el, idx) => idx === 0 ? el : (el[0] && `${el[0]}.`))
                  ?.filter(Boolean)
                  ?.join(' ')
              }
            </Typography>
            <ForwardIcon color="primary" fontSize="small"/>
            <Typography variant="body2">
              {
                card.TASK?.PERFORMER?.NAME
                  .split(' ')
                  .map((el, idx) => idx === 0 ? el : (el[0] && `${el[0]}.`))
                  ?.filter(Boolean)
                  ?.join(' ')
                  ?? 'не указан'
              }
            </Typography>
          </Stack>}
          <Box style={{ lineHeight: '1em' }}>
            {/* <Typography
              display={!card.DEAL?.CONTACT_NAME ? 'none' : 'inline'}
              variant="body2"
              component="span"
            >
              {`${card.DEAL?.CONTACT_NAME}, `}
            </Typography> */}
            <Typography
              variant="body2"
              fontWeight={600}
            >
              {card.TASK?.TASKTYPE?.NAME && `${card.TASK?.TASKTYPE?.NAME} - ${truncate(card.TASK?.USR$NAME ?? '', 39)}`}
            </Typography>
          </Box>
        </Stack>
      </CustomizedCard>
      <PermissionsGate actionAllowed={userPermissions?.tasks.PUT}>
        {memoKanbanEditTask}
      </PermissionsGate>
    </>

  );
}

export default KanbanTasksCard;
