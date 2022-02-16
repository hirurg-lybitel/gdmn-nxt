import './chart-donut.module.less';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import { Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { CardWithBorderShadow } from '../../main-card/main-card';

/* eslint-disable-next-line */
export interface ChartDonutProps {}

export function ChartDonut(props: ChartDonutProps) {
  const theme = useTheme();

  const [series, setSeries] = useState([55, 17, 15, 44, 22, 9]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newSeries = series.map(el => Math.floor(Math.random() * (10 - 3)) + 3)
      setSeries(newSeries);
    }, 5000);
    return () => clearTimeout(timer);
  });

  const chartOptions: ApexCharts.ApexOptions = {
    labels: ['Минская', 'Бресткая ', 'Витебская ', 'Гомельская', 'Гродненская', 'Могилевская'],
    chart: {
      toolbar: {
        show: true,
      },
    },
    legend: {
      fontSize: '20em',
      fontWeight: 600,
      position:'left',
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
      padding: {

        bottom: 150
      },
    },
    dataLabels: {
      style: {
        fontSize: '1em',
      }
    }
  }

  const chartData: ApexCharts.ApexOptions  = {
    series: series
  }


  return (
    <CardWithBorderShadow
      style={{
        flex: 1
      }}
    >
      <Stack direction="column" spacing={3} p={2}>
        <Typography variant="h1">Продажи по областям</Typography>
        <Chart
          type="donut"
          options={chartOptions}
          {...chartData}
        />
      </Stack>

    </CardWithBorderShadow>
  );
}

export default ChartDonut;
