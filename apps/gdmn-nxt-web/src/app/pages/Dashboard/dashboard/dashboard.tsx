import { Stack, useMediaQuery, useTheme } from '@mui/material';
import ChartColumn from '../../../components/Charts/chart-column/chart-column';
import ChartDonut from '../../../components/Charts/chart-donut/chart-donut';
import EarningCard from '../../../components/Charts/earning-card/earning-card';
import OrderCard from '../../../components/Charts/order-card/order-card';
import './dashboard.module.less';

/* eslint-disable-next-line */
export interface DashboardProps {}

export function Dashboard(props: DashboardProps) {
  const theme = useTheme();

  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchDownXl = useMediaQuery(theme.breakpoints.down('xl'));

  return (
    <Stack direction="column" spacing={3} flex={1}>
      <Stack direction={matchDownMd ? 'column' : 'row'} spacing={3} display="flex" height={matchDownMd ? '400px' : '200px'}>
        <EarningCard />
        <OrderCard />
      </Stack>
      <Stack direction={matchDownXl ? 'column' : 'row'} spacing={3} display="flex">
        <ChartColumn />
        <ChartDonut />
      </Stack>
    </Stack>
  );
}

export default Dashboard;
