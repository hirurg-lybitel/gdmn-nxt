import { IKanbanCard, IKanbanTask } from '@gsbelarus/util-api-types';
import { Box, Button, Checkbox, Grid, IconButton, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { GridColDef} from '@mui/x-data-grid-pro';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import styles from './kanban-tasks.module.less';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import KanbanEditTask from '../kanban-edit-task/kanban-edit-task';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { UserState } from '../../../features/user/userSlice';
import { RootState } from '../../../store';
import StyledGrid from '../../Styled/styled-grid/styled-grid';
import { FormikProps } from 'formik';

const useStyles = makeStyles(() => ({
  dataGrid: {
    border: 'none',
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
  const tasks = useMemo(() => card?.TASKS ?? [], [card?.TASKS]);

  const addTask = (newTask: IKanbanTask) => {
    const sortedTasks = [...tasks];
    const lastId = sortedTasks.sort((a, b) => a.ID - b.ID).pop()?.ID ?? 0;
    formik.setFieldValue('TASKS', [...tasks].concat({ ...newTask, ID: lastId + 1 }));
  };

  const updateTask = useCallback((newTask: IKanbanTask) => {
    const newTasks = tasks.map(task => task.ID === newTask.ID ? newTask : task);
    formik.setFieldValue('TASKS', [...newTasks]);
  }, [tasks, formik]);

  const deleteTask = (id: number) => {
    const newTasks = tasks.filter(task => task.ID !== id);
    formik.setFieldValue('TASKS', [...newTasks]);
  };
  const user = useSelector<RootState, UserState>(state => state.user);
  const currentTask = useRef<IKanbanTask | undefined>();

  const setTask = (task?: IKanbanTask) => {
    currentTask.current = task;
  };

  const handleClosedChange = useCallback((row: IKanbanTask) => (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newTask = { ...row, USR$CLOSED: checked };
    updateTask(newTask);
  }, [updateTask]);

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

    addTask(newTask);
    setOpenEditForm(false);
  };

  const handleTaskEditCancelClick = () => {
    setOpenEditForm(false);
  };

  const initTask: IKanbanTask = useMemo(() => ({
    ID: -1 * (formik.values.TASKS?.length ?? 1),
    USR$CARDKEY: card?.ID || -1,
    USR$NAME: '',
    CREATOR: {
      ID: user.userProfile?.contactkey || -1,
      NAME: user.userProfile?.userName || ''
    },
    USR$CLOSED: false
  }), [formik.values.TASKS?.length]);

  const columns: GridColDef[] = useMemo(() => [
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
  ], [handleClosedChange]);

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
      height={'100%'}
    >
      <Stack direction="row">
        <Box flex={1} />
        <IconButton color="primary" onClick={handleTaskAdd}>
          <AddCircleRoundedIcon />
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
