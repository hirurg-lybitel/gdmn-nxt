import './chart-column.module.less';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import CustomizedCard from '../../customized-card/customized-card';
import { Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';


/* eslint-disable-next-line */
export interface ChartColumnProps {}

export function ChartColumn(props: ChartColumnProps) {
  const theme = useTheme();

  const matchDownXl = useMediaQuery(theme.breakpoints.down('xl'));

  const [series21, setSeries21] = useState([25, 33, 52, 44, 60, 47, 38, 47, 60, 30, 64, 79]);
  const [series22, setSeries22] = useState([30, 40, 45, 48, 63, 55, 21, 50, 49, 60, 70, 91]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newSeries21 = series21.map(el => Math.floor(Math.random() * (10 - 3)) + 3);
      setSeries21(newSeries21);

      const newSeries22 = series22.map(el => Math.floor(Math.random() * (10 - 3)) + 3);
      setSeries22(newSeries22);
    }, 4000);
    return () => clearTimeout(timer);
  });

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      id: 'column-bar',
      stacked: false,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    xaxis: {
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    },
    tooltip: {
      theme: 'light'
    },
    plotOptions: {
      bar: {
        horizontal: false,
      }
    },
    legend: {
      fontSize: '15px',
      fontFamily: '\'Roboto\', sans-serif',
      offsetY: 5,

      labels: {
        colors: theme.color.grey[500],

      },
      markers: {
        width: 16,
        height: 16,
        radius: 5
      },
      itemMargin: {
        horizontal: 15,
        vertical: 8
      }
    },
    dataLabels: {
      enabled: false
    },
  };

  const chartData: ApexCharts.ApexOptions = {
    series: [
      {
        name: '2021',
        data: series21
      },
      {
        name: '2022',
        data: series22
      }
    ]
  };

  return (
    <CustomizedCard
      borders
      boxShadows
      style={{
        flex: matchDownXl ? 'none' : 1
      }}
    >
      <Stack direction="column" spacing={3} p={2}>
        <Typography variant="h1">Продажи по месяцам</Typography>
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="bar"
        />
      </Stack>
    </CustomizedCard>

  );
};

export default ChartColumn;
