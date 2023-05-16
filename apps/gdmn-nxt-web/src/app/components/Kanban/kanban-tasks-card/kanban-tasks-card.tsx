import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './kanban-tasks-card.module.less';
import { ColorMode, IKanbanCard, IKanbanTask } from '@gsbelarus/util-api-types';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Box, Stack, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KanbanEditTask from '../kanban-edit-task/kanban-edit-task';
import { useAddHistoryMutation, useAddTaskMutation, useDeleteTaskMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import { IChanges } from '../../../pages/Managment/deals/deals';
import { UserState } from '../../../features/user/userSlice';

export interface KanbanTasksCardProps {
  card: IKanbanCard;
}

export function KanbanTasksCard(props: KanbanTasksCardProps) {
  const { card } = props;

  const [openEditForm, setOpenEditForm] = useState(false);
  const [addTask, { isSuccess: addedTaskSuccess, data: addedTask }] = useAddTaskMutation();
  const [updateTask, { isSuccess: updatedTaskSuccess }] = useUpdateTaskMutation();
  const [deleteTask, { isSuccess: deletedTaskSuccess }] = useDeleteTaskMutation();
  const [addHistory] = useAddHistoryMutation();
  const user = useSelector <RootState, UserState>(state => state.user);
  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);
  const changes = useRef<IChanges[]>([]);

  useEffect(() => {
    if ((updatedTaskSuccess) && changes.current.length > 0) {
      changes.current.forEach(item =>
        addHistory({
          ID: -1,
          USR$CARDKEY: card?.ID || -1,
          USR$TYPE: '2',
          USR$DESCRIPTION: item.fieldName,
          USR$OLD_VALUE: item.oldValue?.toString() || '',
          USR$NEW_VALUE: item.newValue?.toString() || '',
          USR$USERKEY: user.userProfile?.id || -1
        })
      );

      changes.current = [];
    };
  }, [updatedTaskSuccess]);

  useEffect(() => {
    if (addedTaskSuccess && addedTask) {
      changes.current.forEach(item =>
        addHistory({
          ID: -1,
          USR$CARDKEY: item.id,
          USR$TYPE: '1',
          USR$DESCRIPTION: item.fieldName,
          USR$OLD_VALUE: item.oldValue?.toString() || '',
          USR$NEW_VALUE: item.newValue?.toString() || '',
          USR$USERKEY: user.userProfile?.id || -1
        })
      );

      changes.current = [];
    };
  }, [addedTaskSuccess, addedTask]);

  useEffect(() => {
    if ((deletedTaskSuccess) && changes.current.length > 0) {
      changes.current.forEach(item =>
        addHistory({
          ID: -1,
          USR$CARDKEY: item.id,
          USR$TYPE: '3',
          USR$DESCRIPTION: item.fieldName,
          USR$OLD_VALUE: item.oldValue?.toString() || '',
          USR$NEW_VALUE: item.newValue?.toString() || '',
          USR$USERKEY: user.userProfile?.id || -1
        })
      );

      changes.current = [];
    };
  }, [deletedTaskSuccess]);

  const compareTasks = useCallback((newTask: IKanbanTask, oldTask: IKanbanTask) => {
    const changesArr: IChanges[] = [];

    const creator = newTask.CREATOR;
    const performer = newTask.PERFORMER;

    if (creator?.ID !== oldTask.CREATOR?.ID) {
      changesArr.push({
        id: card?.ID || -1,
        fieldName: `Постановщик задачи "${newTask.USR$NAME}"`,
        oldValue: oldTask.CREATOR?.NAME,
        newValue: creator?.NAME
      });
    };

    if (performer?.ID !== oldTask?.PERFORMER?.ID) {
      changesArr.push({
        id: card?.ID || -1,
        fieldName: `Исполнитель задачи "${newTask.USR$NAME}"`,
        oldValue: oldTask?.PERFORMER?.NAME,
        newValue: performer?.NAME
      });
    };

    if (newTask.USR$NAME !== oldTask.USR$NAME) {
      changesArr.push({
        id: card?.ID || -1,
        fieldName: 'Описание задачи',
        oldValue: oldTask?.USR$NAME,
        newValue: newTask?.USR$NAME
      });
    };

    if ((newTask.USR$DEADLINE || -1) !== (oldTask.USR$DEADLINE || -1)) {
      changesArr.push({
        id: card?.ID || -1,
        fieldName: `Срок выполнения задачи "${newTask.USR$NAME}"`,
        oldValue: oldTask?.USR$DEADLINE ? new Date(oldTask?.USR$DEADLINE).toLocaleString('default', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
        newValue: newTask?.USR$DEADLINE ? new Date(newTask?.USR$DEADLINE).toLocaleString('default', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      });
    };

    if (newTask.USR$CLOSED !== oldTask.USR$CLOSED) {
      changesArr.push({
        id: newTask.ID,
        fieldName: `Задача "${newTask.USR$NAME}"`,
        oldValue: !newTask.USR$CLOSED ? 'Выполнена' : 'Не выполнена',
        newValue: newTask.USR$CLOSED ? 'Выполнена' : 'Не выполнена',
      });
    };
    return changesArr;
  }, [card]);

  const colorModeIsLight = useMemo(() => colorMode === ColorMode.Light, [colorMode]);

  const handleTaskEditSubmit = useCallback((task: IKanbanTask, deleting: boolean) => {
    const newTask: IKanbanTask = {
      ...task,
      USR$CARDKEY: card?.ID || -1
    };

    if (deleting) {
      changes.current.push({
        id: card?.ID || -1,
        fieldName: 'Задача',
        oldValue: newTask.USR$NAME || '',
        newValue: newTask.USR$NAME || '',
      });
      deleteTask(newTask.ID);
      setOpenEditForm(false);
      return;
    };

    if (newTask.ID > 0) {
      changes.current = compareTasks(newTask, card.TASK!);

      updateTask(newTask);
      setOpenEditForm(false);
      return;
    };

    changes.current.push({
      id: card?.ID || -1,
      fieldName: 'Задача',
      oldValue: '',
      newValue: newTask.USR$NAME || '',
    });

    addTask(newTask);
    setOpenEditForm(false);
  }, []);

  const doubleClick = useCallback(() => {
    setOpenEditForm(true);
  }, []);

  const handleTaskEditCancelClick = useCallback(() => setOpenEditForm(false), []);

  const memoKanbanEditTask = useMemo(() =>
    <KanbanEditTask
      open={openEditForm}
      task={card.TASK}
      onSubmit={handleTaskEditSubmit}
      onCancelClick={handleTaskEditCancelClick}
    />,
  [openEditForm]);

  return (
    <>
      <CustomizedCard
        borders={colorModeIsLight}
        onDoubleClick={doubleClick}
        style={{
          backgroundColor: colorModeIsLight ? 'whitesmoke' : 'dimgrey',
          padding: '12px',
          cursor: 'pointer'
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4">{card.TASK?.USR$NAME}</Typography>
          <Box>
            <Typography
              display={!card.DEAL?.CONTACT_NAME ? 'none' : 'inline'}
              variant="h2"
              component="span"
            >
              {`${card.DEAL?.CONTACT_NAME}, `}
            </Typography>
            <Typography variant="caption" color={colorModeIsLight ? 'GrayText' : 'lightgray'} component="span" sx={{ display: 'inline' }}>{card.DEAL?.CONTACT?.NAME}</Typography>
          </Box>
          <Typography variant="caption" color={colorModeIsLight ? 'GrayText' : 'lightgray'}>
            {card.TASK?.USR$DEADLINE
              ? (new Date(card.TASK?.USR$DEADLINE)).toLocaleString('default',
                {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                  ...((new Date(card.TASK?.USR$DEADLINE).getHours() !== 0) && { hour: '2-digit', minute: '2-digit' }) })
              : '-/-'}
          </Typography>
          {!!card.TASK?.PERFORMER?.NAME &&
          <Stack direction="row" display="inline-flex" alignItems="center" spacing={0.5} ml={-0.2}>
            <AccountCircleIcon color="primary" fontSize="small" />
            <Typography variant="h2">{card.TASK?.PERFORMER?.NAME}</Typography>
          </Stack>}
          <Typography variant="body1">{card.DEAL?.USR$NAME}</Typography>
        </Stack>
      </CustomizedCard>
      {memoKanbanEditTask}
    </>

  );
}

export default KanbanTasksCard;
