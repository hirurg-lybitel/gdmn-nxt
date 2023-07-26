import { Grid } from '@mui/material';
import ChartColumn from '../../../components/Charts/chart-column/chart-column';
import ChartDonut from '../../../components/Charts/chart-donut/chart-donut';
import EarningCard from '../../../components/Charts/earning-card/earning-card';
import OrderCard from '../../../components/Charts/order-card/order-card';
import './dashboard.module.less';

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  return (
    <Grid container spacing={3} >
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xl={6} lg={12} md={12} xs={12}>
            <ChartColumn />
          </Grid>
          <Grid item xl={6} lg={12} md={12} xs={12}>
            <ChartDonut />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Dashboard;
