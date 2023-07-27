import { CardContent, CardHeader, Grid, Stack, Typography, useTheme } from '@mui/material';
import ChartDonut from '../../../components/Charts/chart-donut/chart-donut';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useGetKanbanDealsQuery, useGetKanbanTasksQuery } from '../../../features/kanban/kanbanApi';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { ColorMode } from '@gsbelarus/util-api-types';
import CircularIndeterminate from '../../../components/helpers/circular-indeterminate/circular-indeterminate';
import { useCallback, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DateRange } from '@mui/x-date-pickers-pro';

interface TaskCardProps {
  title: string;
  quantity: number;
  color?: string;
  loading?: boolean;
}

const TaskCard = ({ title, quantity = 0, color, loading = true }: TaskCardProps) => {
  const theme = useTheme();
  return (
    <CustomizedCard boxShadows={theme.palette.mode === ColorMode.Light} style={{ minHeight: '180px' }}>
      <CardHeader
        sx={{
          '.MuiCardHeader-content': {
            display: 'contents'
          }
        }}
        title={<Typography
          noWrap
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {title}
        </Typography>}
      />
      <CardContent style={{ paddingTop: 0, display: 'inline' }}>
        <Stack alignItems="center">
          {loading
            ? <CircularIndeterminate open={true} />
            : <Typography variant="h6" {...(color && { color: color })}>{quantity}</Typography>}

        </Stack>
      </CardContent>

    </CustomizedCard>
  );
};

interface TasksSummarizeProps {
  period: DateRange<Dayjs>
}

export const TasksSummarize = ({ period }: TasksSummarizeProps) => {
  const userId = useSelector<RootState, number>(state => state.user.userProfile?.id ?? -1);
  const { data: tasks = [], isFetching } = useGetKanbanTasksQuery({
    userId,
    period: [
      dayjs(period[0])
        .toDate()
        .getTime(),
      dayjs(period[1])
        .toDate()
        .getTime()
    ]
  });
  const { data: deals = [], isFetching: dealsIsFetching } = useGetKanbanDealsQuery({
    userId,
    filter: {
      period: [
        dayjs(period[0])
          .toDate()
          .getTime(),
        dayjs(period[1])
          .toDate()
          .getTime()
      ]
    }
  });

  const tasksResults = useMemo(() => {
    const completed = tasks[tasks.length - 1]?.CARDS.length ?? 0;
    const inProgress = tasks.slice(1).reduce((acc, { CARDS }) => acc + CARDS.reduce((a, { TASK }) => a + (TASK?.USR$INPROGRESS ? 1 : 0), 0), 0);
    const overdued = tasks[0]?.CARDS.length ?? 0;
    const dealWithoutTasks = deals.reduce((acc, { CARDS }) => acc + CARDS.reduce((a, card) => a + (!card.DEAL?.DENIED && !card.DEAL?.USR$DONE && (card.TASKS?.length ?? 0) === 0 ? 1 : 0), 0), 0);

    return {
      completed,
      inProgress,
      overdued,
      dealWithoutTasks
    };
  }, [tasks, deals]);

  return (
    <>
      <Grid
        item
        sm={1}
        md={1}
        lg={6}
      >
        <TaskCard
          title="Выполненные"
          loading={isFetching}
          quantity={tasksResults.completed}
          color="lightgreen"
        />
      </Grid>
      <Grid
        item
        sm={1}
        md={1}
        lg={6}
      >
        <TaskCard
          title="В работе"
          loading={isFetching}
          quantity={tasksResults.inProgress}
        />
      </Grid>
      <Grid
        item
        sm={1}
        md={1}
        lg={6}
      >
        <TaskCard
          title="Просроченные"
          loading={isFetching}
          quantity={tasksResults.overdued}
        />
      </Grid>
      <Grid
        item
        sm={1}
        md={1}
        lg={6}
      >
        <TaskCard
          title="Сделки без задач"
          loading={dealsIsFetching}
          quantity={tasksResults.dealWithoutTasks}
          color="rgb(255, 82, 82)"
        />
      </Grid>
    </>
  );
};
