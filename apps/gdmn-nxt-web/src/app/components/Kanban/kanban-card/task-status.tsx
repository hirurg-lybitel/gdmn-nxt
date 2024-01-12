import { ColorMode, IKanbanTask } from '@gsbelarus/util-api-types';
import { Box, Checkbox, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { ChangeEvent, WheelEvent, useCallback, useState } from 'react';
import StyledGrid from '../../Styled/styled-grid/styled-grid';
import { GridColDef } from '@mui/x-data-grid-pro';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import useDateComparator from '../../helpers/hooks/useDateComparator';
import useDeadlineColor from '../../helpers/hooks/useDeadlineColor';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useUpdateTaskMutation } from '../../../features/kanban/kanbanApi';

interface ExpandedListProps {
  open: boolean;
  tasks: IKanbanTask[];
}

const ExpandedList = ({ open, tasks }: ExpandedListProps) => {
  const [updateTask] = useUpdateTaskMutation();
  const handleClosedChange = useCallback((row: IKanbanTask) => (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newTask = { ...row, USR$CLOSED: checked };
    updateTask(newTask);
  }, []);

  const { getDayDiff } = useDateComparator();
  const { daysColor } = useDeadlineColor();

  const colorMode = useSelector((state: RootState) => state.settings.customization.colorMode);

  if (!open) return <></>;

  const columns: GridColDef[] = [
    {
      field: 'USR$CLOSED',
      headerName: '',
      maxWidth: 25,
      minWidth: 25,
      renderCell: ({ value, row }) =>
        <div style={{ position: 'absolute', left: '-2px', display: 'flex', alignItems: 'center' }}>
          <Checkbox
            style={{ padding: 0 }}
            checked={value}
            onChange={handleClosedChange(row)}
          />
        </div>
    },
    {
      field: 'USR$NAME',
      headerName: 'Описание',
      flex: 1,
      renderCell: (params) =>
        <Typography
          variant="subtitle2"
          fontWeight={400}
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
                  variant="subtitle2"
                  fontWeight={600}
                >
              Без срока
                </Typography>
                :
                <Typography
                  variant="subtitle2"
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

  const rowHeight = 50;
  const maxLines = 4;

  const handleScroll = (e: WheelEvent<HTMLDivElement>) => {
    if (tasks.length > maxLines) {
      e.stopPropagation();
    }
  };

  return (
    <div
      hidden={!open}
      style={{
        height: tasks.length * rowHeight,
        maxHeight: maxLines * rowHeight
      }}
      onWheelCapture={handleScroll}
    >
      <StyledGrid
        sx={{
          '& .MuiDataGrid-cell': {
            padding: 0,
          },
        }}
        onRowDoubleClick={(p, e) => e.stopPropagation()}
        rows={tasks}
        columns={columns}
        rowHeight={rowHeight}
        hideColumnHeaders
        hideFooter
        disableRowSelectionOnClick
      />
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
    <Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
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
            <FactCheckOutlinedIcon color="action" fontSize="small" />
            <Typography variant="subtitle2">
              {`${allTasks} задач`}
            </Typography>
          </>}
        <Tooltip title={expandedList ? '' : 'Раскрыть список задач'} arrow>
          <IconButton
            size="small"
            style={{ padding: 0 }}
            onClick={handleClick}
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
