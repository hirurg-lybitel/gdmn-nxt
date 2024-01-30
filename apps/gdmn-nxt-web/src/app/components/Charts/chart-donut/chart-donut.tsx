import style from './chart-donut.module.less';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, Stack, Theme, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import ChartSkeleton from './chart-skeleton';
import { ColorMode } from '@gsbelarus/util-api-types';
import { DateRange } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from 'dayjs';
import { makeStyles } from '@mui/styles';

export interface ChartDonutProps {
  period: DateRange<Dayjs>
};

const useStyles = makeStyles((theme: Theme) => ({
  donut: {
    '& .apexcharts-canvas ::-webkit-scrollbar-thumb': {
      background: 'var(--color-scroll-thumb)'
    },
    '& .apexcharts-canvas ::-webkit-scrollbar-thumb:hover': {
      background: 'var(--color-scroll-thumb-hover)'
    }
  }
}));

export function ChartDonut({ period }: ChartDonutProps) {
  const theme = useTheme();
  const matchUpLg = useMediaQuery(theme.breakpoints.up('lg'));

  const classes = useStyles();

  const { data: stages, isLoading: stagesIsLoading, refetch } = useGetKanbanDealsQuery({
    userId: -1,
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

  const series = stages?.map(stage => stage.CARDS?.length || 0) || [];


  const colors = [
    theme.color.purple[500],
    theme.color.red.A200,
    theme.color.yellow['800'],
    theme.color.green.A400,
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
      offsetY: 0,
      fontFamily: theme.fontFamily,
      fontSize: '18',
      fontWeight: 400,
      position: 'left',
      formatter(legendName, opts) {
        const seriesSum = opts.w.globals.series?.reduce((sum: number, s: number) => sum + s, 0);
        const oneValue = opts.w.globals.series.filter((item: number) => item > 0);
        const seriesValue = opts.w.globals.series[opts.seriesIndex];
        const percentValue = (seriesValue / seriesSum) * 100;
        const percentString = (() => {
          if (oneValue.length === 1) {
            if (seriesValue === 0) return '    (0.0%)';
            return '(100.0%)';
          }
          if (percentValue < 9) {
            return `  (${percentValue.toFixed(1)}%)`;
          }
          return `(${percentValue.toFixed(1)}%)`;
        })();
        return (
          `<div style="position:relavite; display: inline-grid; grid-template-columns: auto auto; width: calc(100% - 15px); align-items: center">
            <div>${legendName}</div>
            <div style=" ${seriesSum > 0 ? '' : 'visibility: hidden;}'} padding-left:10px; display: flex; justify-content: end; white-space: pre;text-align: right; font-size: 15px"><span>${seriesValue} ${percentString}</span></div>
          </div>`);
      },
      // itemMargin: {
      //   vertical: 10,
      // },
      markers: {
        fillColors: colors,
        width: 12,
        height: 12,
        radius: 2,
        offsetY: 0,
      },
      labels: {
        colors: theme.palette.text.primary,
      },

    },
    grid: {
      show: true,
      padding: {
        bottom: 0
      },
    },
    dataLabels: {
      style: {
        fontSize: matchUpLg ? '0.85em' : '1em',

      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: matchUpLg ? '0.85em' : '2em'
            },
            value: {
              show: true,
              fontSize: '1.5em',
              color: theme.palette.text.primary
            }
          }
        }
      }
    },
  };

  const chartData: ApexCharts.ApexOptions = {
    series: series
  };

  return (
    <CustomizedCard
      boxShadows={theme.palette.mode === ColorMode.Light}
      sx={(theme: any) => ({
        flex: 1,
        display: 'flex',
        [theme.breakpoints.down('lg')]: {
          minHeight: 'calc(100vh - 130px)',
        },
        '& .apexcharts-legend': {
          maxWidth: '40%',
          minWidth: '260px',
        }
      })}
    >
      <Stack
        direction="column"
        spacing={3}
        p={2}
        flex={1}
        display="flex"
        style={{ maxWidth: '100%', padding: '15px 0' }}
      >
        {stagesIsLoading
          ? <ChartSkeleton />
          : <>
            <Typography variant="h6" style={{ paddingLeft: '15px' }}>Статус сделок</Typography>
            <Box
              className={classes.donut}
              flex={1}
              style={{ color: 'black', paddingLeft: '1px', paddingRight: '5px', marginTop: 0 }}
            >
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
