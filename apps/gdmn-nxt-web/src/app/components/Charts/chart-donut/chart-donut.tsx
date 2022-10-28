import './chart-donut.module.less';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import ChartSkeleton from '../chart-skeleton/chart-skeleton';

/* eslint-disable-next-line */
export interface ChartDonutProps {}

export function ChartDonut(props: ChartDonutProps) {
  const theme = useTheme();

  const matchDownXl = useMediaQuery(theme.breakpoints.down('xl'));

  const { data: stages, isLoading: stagesIsLoading, refetch } = useGetKanbanDealsQuery({ userId: -1 });

  const series = stages?.map(stage => stage.CARDS?.length || 0) || [];

  const colors = [
    theme.color.purple[500],
    theme.color.red['A200'],
    theme.color.yellow['800'],
    theme.color.green['A400'],
    theme.color.blueGrey[400]
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    labels: stages?.map(stage => stage.USR$NAME) ?? [],
    chart: {
      toolbar: {
        show: true,
      },
    },
    fill: {
      colors
    },
    colors,
    legend: {
      fontSize: '20em',
      fontWeight: 600,
      position: 'left',
      itemMargin: {
        vertical: 10,
      },
      markers: {
        fillColors: colors,
        width: 20,
        height: 20,
        radius: 5,
        offsetY: 2,
      },
      labels: {
        colors: theme.color.grey[500],
      },
    },
    grid: {
      show: true,
      padding: {
        bottom: 50
      },
    },
    dataLabels: {
      style: {
        fontSize: '1em',
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '2em'
            },
            value: {
              show: true,
              fontSize: '1.5em'
            }
          }
        }
      }
    }
  };

  const chartData: ApexCharts.ApexOptions = {
    series: series
  };

  return (
    <CustomizedCard
      borders
      boxShadows
      sx={(theme: any) => ({
        flex: 1,
        display: 'flex',
        [theme.breakpoints.down('xl')]: {
          minHeight: 'calc(100vh - 130px)',
        },
        [theme.breakpoints.up('xl')]: {
          minHeight: 'calc(100vh - 300px)',
        },
        maxHeight: 'calc(100vh - 130px)'
      })}
    >
      <Stack direction="column" spacing={3} p={2} flex={1} display="flex">
        {stagesIsLoading
          ? <ChartSkeleton />
          : <>
            <Typography variant="h1">Статус сделок</Typography>
            <Box flex={1}>
              <Chart
                type="donut"
                height="100%"
                options={chartOptions}
                {...chartData}
              />
            </Box>
          </>}
      </Stack>

    </CustomizedCard>
  );
};

export default ChartDonut;
