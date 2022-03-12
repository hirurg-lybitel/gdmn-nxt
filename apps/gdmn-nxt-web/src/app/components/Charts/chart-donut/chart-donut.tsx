import './chart-donut.module.less';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import CustomizedCard from '../../customized-card/customized-card';
import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';

/* eslint-disable-next-line */
export interface ChartDonutProps {}

export function ChartDonut(props: ChartDonutProps) {
  const theme = useTheme();

  const matchDownXl = useMediaQuery(theme.breakpoints.down('xl'));

  const { data: stages, isFetching: stagesIsFetching } = useGetKanbanDealsQuery();

  const series = stages?.map(stage => stage.CARDS.length);

  // const [series, setSeries] = useState([55, 17, 15, 44, 22, 9]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     // const newSeries = series.map(el => Math.floor(Math.random() * (10 - 3)) + 3)
  //     // setSeries(newSeries);
  //     refetch();
  //   }, 5000);
  //   return () => clearTimeout(timer);
  // });

  const chartOptions: ApexCharts.ApexOptions = {
    labels: stages?.map(stage => stage.USR$NAME) ?? [],
    chart: {
      toolbar: {
        show: true,
      },
    },
    legend: {
      fontSize: '20em',
      fontWeight: 600,
      position: 'left',
      itemMargin: {
        vertical: 10,
      },
      markers: {
        width: 20,
        height: 20,
        radius: 5
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
      style={{
        flex: matchDownXl ? 'none' : 1
      }}
    >
      {stagesIsFetching
        ? {} // ???
        : <Stack direction="column" spacing={3} p={2}>
          <Typography variant="h1">Статус сделок</Typography>
          <Chart
            type="donut"
            height={matchDownXl ? 'auto' : '550px'}
            options={chartOptions}
            {...chartData}
          />
        </Stack>
      }
    </CustomizedCard>
  );
};

export default ChartDonut;
