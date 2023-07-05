import { IKanbanCard, IKanbanTask } from '@gsbelarus/util-api-types';
import { Box, Button, Checkbox, Grid, IconButton, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DataGridPro, GridColDef, GridColumns, ruRU } from '@mui/x-data-grid-pro';
import CustomNoRowsOverlay from '../../Styled/styled-grid/DataGridProOverlay/CustomNoRowsOverlay';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import styles from './kanban-tasks.module.less';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAddHistoryMutation, useAddTaskMutation, useDeleteTaskMutation, useGetTasksQuery, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import KanbanEditTask from '../kanban-edit-task/kanban-edit-task';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IChanges } from '../../../pages/Managment/deals/deals';
import { useSelector } from 'react-redux';
import { UserState } from '../../../features/user/userSlice';
import { RootState } from '../../../store';
import StyledGrid from '../../Styled/styled-grid/styled-grid';
import { FormikProps } from 'formik';

const useStyles = makeStyles(() => ({
  dataGrid: {
    border: 'none',
    '& ::-webkit-scrollbar': {
      width: '10px',
      height: '10px',
      backgroundColor: 'transparent',
      borderRadius: '6px'
    },
    '& ::-webkit-scrollbar:hover': {
      backgroundColor: '#f0f0f0',
    },
    '& ::-webkit-scrollbar-thumb': {
      position: 'absolute',
      right: 10,
      borderRadius: '6px',
      backgroundColor: 'rgba(170, 170, 170, 0.5)',
    },
    '& ::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#999',
    },
    '& .MuiTypography-root, .MuiBox-root': {
      fontSize: '0.8rem'
    },
    '& .MuiDataGrid-renderingZone': {
      maxHeight: 'none !important'
    },
    '& .MuiDataGrid-cell': {
      lineHeight: 'unset !important',
      maxHeight: 'none !important',
      whiteSpace: 'normal',
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiDataGrid-columnHeader': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiDataGrid-row': {
      maxHeight: 'none !important',
      cursor: 'pointer !important',
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none'
    },
  },
}));

export interface KanbanTasksProps {
  card?: IKanbanCard;
  formik: FormikProps<IKanbanCard>;
}

export function KanbanTasks(props: KanbanTasksProps) {
  const { card, formik } = props;

  const classes = useStyles();

  const [openEidtForm, setOpenEditForm] = useState(false);
  const { data: tasks = [], refetch, isFetching } = useGetTasksQuery(card?.ID || -1);
  const [addTask, { isSuccess: addedTaskSuccess, data: addedTask }] = useAddTaskMutation();
  const [updateTask, { isSuccess: updatedTaskSuccess }] = useUpdateTaskMutation();
  const [deleteTask, { isSuccess: deletedTaskSuccess }] = useDeleteTaskMutation();
  const user = useSelector<RootState, UserState>(state => state.user);

  const changes = useRef<IChanges[]>([]);

  const currentTask = useRef<IKanbanTask | undefined>();

  const setTask = (task?: IKanbanTask) => {
    currentTask.current = task;
  };

  useEffect(() => {
    /** Надо сообщить формику, что мы изменили задачи */
    if (isFetching) return;

    if (updatedTaskSuccess || deletedTaskSuccess) {
      formik.setFieldValue('TASKS', [...tasks]);
    }
  }, [isFetching, updatedTaskSuccess, deletedTaskSuccess]);

  const handleClosedChange = useCallback((row: IKanbanTask) => (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newTask = { ...row, USR$CLOSED: checked };

    updateTask(newTask);
  }, []);

  const handleTaskEdit = ({ row }: any) => {
    setTask(row);
    setOpenEditForm(true);
  };

  const handleTaskAdd = () => {
    setTask();
    setOpenEditForm(true);
  };

  const handleTaskEditSubmit = (task: IKanbanTask, deleting: boolean) => {
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

    changes.current.push({
      id: card?.ID || -1,
      fieldName: 'Задача',
      oldValue: '',
      newValue: newTask.USR$NAME || '',
    });

    addTask(newTask);
    setOpenEditForm(false);
  };

  const handleTaskEditCancelClick = () => {
    setOpenEditForm(false);
  };

  const initTask: IKanbanTask = useMemo(() => ({
    ID: -1,
    USR$CARDKEY: card?.ID || -1,
    USR$NAME: '',
    CREATOR: {
      ID: user.userProfile?.contactkey || -1,
      NAME: user.userProfile?.userName || ''
    },
    USR$CLOSED: false
  }), []);

  const columns: GridColumns = useMemo(() => [
    { field: 'USR$CLOSED', headerName: '', width: 50, align: 'center',
      renderCell: ({ value, row }) => <Checkbox checked={value} onChange={handleClosedChange(row)}/> },
    { field: 'USR$NAME', headerName: 'Описание', flex: 1, minWidth: 100,
      renderCell: ({ value }) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value}</Box>
    },
    { field: 'USR$DEADLINE', headerName: 'Срок', width: 80,
      renderCell: ({ value }) =>
        <Stack direction="column">
          <Typography>{value && (new Date(value)?.toLocaleString('default', { day: '2-digit', month: '2-digit', year: 'numeric' }))}</Typography>
          <Typography>{value && (new Date(value)?.toLocaleString('default', { hour: '2-digit', minute: '2-digit' }))}</Typography>
        </Stack>
    },
    { field: 'USR$DATECLOSE', headerName: 'Закрыта', width: 80,
      renderCell: ({ value }) =>
        <Stack direction="column">
          <Typography>{value && (new Date(value)?.toLocaleString('default', { day: '2-digit', month: '2-digit', year: 'numeric' }))}</Typography>
          <Typography>{value && (new Date(value)?.toLocaleString('default', { hour: '2-digit', minute: '2-digit' }))}</Typography>
        </Stack>
    },
    { field: 'USR$CREATIONDATE', headerName: 'Создана', width: 80,
      renderCell: ({ value }) =>
        <Stack direction="column">
          <Typography>{value && (new Date(value)?.toLocaleString('default', { day: '2-digit', month: '2-digit', year: 'numeric' }))}</Typography>
          <Typography>{value && (new Date(value)?.toLocaleString('default', { hour: '2-digit', minute: '2-digit' }))}</Typography>
        </Stack>
    },
    { field: 'PERFORMER', headerName: 'Исполнитель', width: 130,
      renderCell: ({ value }) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value?.NAME}</Box>
    },
    { field: 'CREATOR', headerName: 'Создатель', width: 130,
      renderCell: ({ value }) => <Box style={{ width: '100%', whiteSpace: 'initial' }}>{value?.NAME}</Box>
    },
  ], [card?.ID]);

  const memoKanbanEditTask = useMemo(() =>
    <KanbanEditTask
      open={openEidtForm}
      task={currentTask.current ? currentTask.current : initTask}
      onSubmit={handleTaskEditSubmit}
      onCancelClick={handleTaskEditCancelClick}
    />,
  [openEidtForm, currentTask.current]);

  return (
    <Stack
      direction="column"
      flex="1"
      display="flex"
      spacing={1}
    >
      <Stack direction="row">
        <Box flex={1} />
        <IconButton color="primary" onClick={handleTaskAdd}>
          <AddCircleRoundedIcon />
        </IconButton>
        <IconButton color="primary" onClick={refetch} >
          <RefreshIcon />
        </IconButton>
      </Stack>
      <CustomizedCard
        borders
        style={{
          flex: 1,
        }}
      >
        <StyledGrid
          className={classes.dataGrid}
          rows={tasks || []}
          columns={columns}
          loading={isFetching}
          hideFooter
          hideHeaderSeparator
          disableColumnSelector
          disableColumnFilter
          disableColumnResize
          disableColumnReorder
          disableColumnMenu
          disableColumnPinning
          onRowDoubleClick={handleTaskEdit}
        />
      </CustomizedCard>
      {memoKanbanEditTask}
    </Stack>
  );
}

export default KanbanTasks;
