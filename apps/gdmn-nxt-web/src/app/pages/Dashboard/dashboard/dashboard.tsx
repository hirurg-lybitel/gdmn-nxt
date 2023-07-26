import { Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ChartColumn from '../../../components/Charts/chart-column/chart-column';
import ChartDonut from '../../../components/Charts/chart-donut/chart-donut';
import EarningCard from '../../../components/Charts/earning-card/earning-card';
import OrderCard from '../../../components/Charts/order-card/order-card';
import './dashboard.module.less';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { useSelector } from 'react-redux';
import { DealsSummarize } from './deals-summarize';
import { TasksSummarize } from './tasks-summarize';

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
      spacing={3}
    >
      <Grid
        container
        item
        justifyContent="center"
      >
        <ToggleButtonGroup
          color="primary"
          // value={alignment}
          exclusive
          // onChange={handleChange}
        >
          <ToggleButton value="web">Сегодня</ToggleButton>
          <ToggleButton value="android">Вчера</ToggleButton>
          <ToggleButton value="ios">Неделя</ToggleButton>
          <ToggleButton value="ios">Месяц</ToggleButton>
          <ToggleButton value="ios">Период</ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid container item>
        <DealsSummarize />
      </Grid>
      <Grid
        container
        item
        spacing={3}
        columns={{ xs: 12, lg: 12 }}
      >
        <Grid
          container
          item
          spacing={3}
          columns={{ sm: 2, md: 4, lg: 12 }}
          xs={12}
          lg={5}
        >
          <TasksSummarize />
        </Grid>
        <Grid
          container
          item
          xs={12}
          lg={7}
        >
          <ChartDonut />
        </Grid>
      </Grid>
      <Grid container item>
        <ChartColumn />
      </Grid>
    </Grid>
  );
}

export default Dashboard;

