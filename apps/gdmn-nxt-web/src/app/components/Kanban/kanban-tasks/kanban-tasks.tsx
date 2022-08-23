import { IKanbanCard, IKanbanTask } from '@gsbelarus/util-api-types';
import { Box, Button, Checkbox, Grid, IconButton, Stack, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DataGridPro, GridColDef, ruRU } from '@mui/x-data-grid-pro';
import CustomNoRowsOverlay from '../../Styled/styled-grid/DataGridProOverlay/CustomNoRowsOverlay';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import styles from './kanban-tasks.module.less';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAddTaskMutation, useDeleteTaskMutation, useGetTasksQuery, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import KanbanEditTask from '../kanban-edit-task/kanban-edit-task';
import { useRef, useState } from 'react';

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
      whiteSpace: 'normal'
    },
    '& .MuiDataGrid-row': {
      maxHeight: 'none !important'
    }
  },
}));

export interface KanbanTasksProps {
  card?: IKanbanCard;
}

export function KanbanTasks(props: KanbanTasksProps) {
  const { card } = props;

  const classes = useStyles();

  const [openEidtForm, setOpenEditForm] = useState(false);

  const { data: tasks, refetch, isFetching } = useGetTasksQuery(card?.ID || -1);
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const currentTask = useRef<IKanbanTask | undefined>();

  const setTask = (task?: IKanbanTask) => {
    currentTask.current = task;
  };


  const handleClosedChange = (checked: boolean, row: any) => {
    console.log(checked, row);
    const newTask = { ...row, USR$CLOSED: checked };

    updateTask(newTask);
  };

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

  const columns: GridColDef[] = [
    { field: 'USR$CLOSED', headerName: '', width: 50, align: 'center',
      renderCell: ({ value, row }) => <Checkbox checked={value} onChange={(e, checked) => handleClosedChange(checked, row)}/> },
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
  ];

  return (
    <Stack
      direction="column"
      flex="1"
      display="flex"
      spacing={1}
    >
      <Stack direction="row">
        <Box flex={1} />
        <IconButton color="primary" size="large" onClick={refetch} >
          <RefreshIcon />
        </IconButton>
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
        <DataGridPro
          className={classes.dataGrid}
          localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
          rows={tasks || []}
          getRowId={row => row.ID}
          columns={columns}
          loading={isFetching}
          pagination
          rowsPerPageOptions={[20]}
          pageSize={20}
          components={{
            NoRowsOverlay: CustomNoRowsOverlay
          }}
          onRowDoubleClick={handleTaskEdit}
          hideFooter
          disableColumnSelector
          disableColumnFilter
          disableColumnResize
          disableColumnReorder
          disableColumnMenu
          disableColumnPinning
        />
      </CustomizedCard>
      <KanbanEditTask
        open={openEidtForm}
        task={currentTask.current}
        onSubmit={handleTaskEditSubmit}
        onCancelClick={handleTaskEditCancelClick}
      />
    </Stack>
  );
}

export default KanbanTasks;
