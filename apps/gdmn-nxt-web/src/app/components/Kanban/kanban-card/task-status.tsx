import { ColorMode, IKanbanTask } from '@gsbelarus/util-api-types';
import { Box, Checkbox, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { ChangeEvent, MouseEvent, WheelEvent, useCallback, useMemo, useRef, useState } from 'react';
import StyledGrid from '../../Styled/styled-grid/styled-grid';
import { GridColumns, GridRowParams } from '@mui/x-data-grid-pro';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useDateComparator from '../../helpers/hooks/useDateComparator';
import useDeadlineColor from '../../helpers/hooks/useDeadlineColor';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useDeleteTaskMutation, useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';
import KanbanEditTask from '../kanban-edit-task/kanban-edit-task';
import Confirmation from '@gdmn-nxt/components/helpers/confirmation';

interface ExpandedListProps {
  open: boolean;
  tasks: IKanbanTask[];
}

const ExpandedList = ({ open, tasks }: ExpandedListProps) => {
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleClosedChange = useCallback((row: IKanbanTask, checked: boolean) => () => {
    const newTask = { ...row, USR$CLOSED: checked };
    updateTask(newTask);
  }, []);

  const currentTask = useRef<IKanbanTask | undefined>();
  const [editTaskForm, setEditTaskForm] = useState(false);

  const { getDayDiff } = useDateComparator();
  const { daysColor } = useDeadlineColor();

  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);

  const columns: GridColumns = [
    {
      field: 'USR$CLOSED',
      headerName: '',
      maxWidth: 25,
      minWidth: 25,
      renderCell: ({ value, row }) =>
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center' }}>
          <Confirmation
            title={'Подтверждение'}
            text={`Пометить как ${value ? 'не выполнена' : 'выполнена'}?`}
            onConfirm={handleClosedChange(row, !value)}
          >

            <Checkbox
              style={{ padding: 0 }}
              checked={value}
            />
          </Confirmation>
        </div>
    },
    {
      field: 'USR$NAME',
      headerName: 'Описание',
      flex: 1,
      renderCell: (params) =>
        <Typography
          variant="body2"
          whiteSpace="normal"
        >
          {params.value}
        </Typography>,
    },
    {
      field: 'USR$DEADLINE',
      headerName: 'Срок',
      maxWidth: 80,
      renderCell: ({ value, row }) => {
        const closed = row.USR$CLOSED;
        const { days, postfix } = getDayDiff(new Date(value), new Date(), { withText: true });

        return (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
            {
              !value
                ? <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  Без срока
                </Typography>
                :
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={closed ? colorMode === ColorMode.Light ? 'green' : 'lightgreen' : daysColor(days)}
                >
                  {row.USR$CLOSED
                    ? 'Выполнена'
                    : days === 0 ? 'Сегодня' : `${Math.abs(days)} ${postfix}`}
                </Typography>
            }
          </div>
        );
      }
    },
  ];

  const setTask = (task?: IKanbanTask) => {
    currentTask.current = task;
  };

  const onRowDoubleClick = useCallback(({ row }: GridRowParams<IKanbanTask>, e: any) => {
    e.stopPropagation();
    setTask(row);
    setEditTaskForm(true);
  }, []);

  const handleTaskEditSubmit = useCallback((task: IKanbanTask, deleting: boolean) => {
    deleting
      ? deleteTask(task.ID)
      : updateTask(task);
    setEditTaskForm(false);
  }, []);

  const handleTaskEditCancelClick = useCallback(() => setEditTaskForm(false), []);

  const memoKanbanEditTask = useMemo(() =>
    currentTask.current
      ? <KanbanEditTask
        open={editTaskForm}
        task={currentTask.current}
        onSubmit={handleTaskEditSubmit}
        onCancelClick={handleTaskEditCancelClick}
      />
      : <></>,
  [editTaskForm]);

  const rowHeight = 40;
  const maxLines = 4;

  const handleScroll = (e: WheelEvent<HTMLDivElement>) => {
    if (tasks.length > maxLines) {
      e.stopPropagation();
    }
  };

  return (
    <div
      style={{
        height: open ? tasks.length * rowHeight : '1px',
        visibility: open ? 'visible' : 'hidden',
        maxHeight: maxLines * rowHeight,
        transition: 'height 0.5s, visibility  0.5s'
      }}
      onWheelCapture={handleScroll}
    >
      <StyledGrid
        sx={{
          '& .MuiDataGrid-cell': {
            padding: 0,
          },
          '& .MuiTypography-root': {
            lineHeight: 1,
          },
          color: 'inherit'
        }}
        onRowDoubleClick={onRowDoubleClick}
        rows={tasks}
        columns={columns}
        rowHeight={rowHeight}
        hideColumnHeaders
        hideFooter
        disableSelectionOnClick
      />
      {memoKanbanEditTask}
    </div>
  );
};

interface TaskStatusProps {
  tasks: IKanbanTask[];
}

export function TaskStatus({ tasks }: TaskStatusProps) {
  const [expandedList, setExpandedList] = useState(false);

  const handleClick = useCallback(() => setExpandedList(prev => !prev), []);

  if (!tasks || !tasks?.length) return <></>;

  const allTasks = tasks?.length;
  const closedTasks = tasks?.filter(task => task.USR$CLOSED).length;
  return (
    <Stack flex={1}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        onClick={handleClick}
      >
        {closedTasks
          ? <>
            <Box sx={{ position: 'relative', display: 'flex', }}>
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
            <Typography variant="body2">
              {`${closedTasks} из ${allTasks} задач`}
            </Typography>
          </>
          : <>
            <FactCheckOutlinedIcon fontSize="small" />
            <Typography variant="body2">
              {`${allTasks} задач`}
            </Typography>
          </>}
        <Tooltip title={expandedList ? '' : 'Раскрыть список задач'} arrow>
          <IconButton
            size="small"
            style={{ padding: 0 }}
            color="inherit"
          >
            {
              expandedList
                ? <KeyboardArrowDownIcon fontSize="small" />
                : <KeyboardArrowRightIcon fontSize="small" />
            }
          </IconButton>
        </Tooltip>
      </Stack>
      <ExpandedList open={expandedList} tasks={tasks} />
    </Stack>
  );
};
