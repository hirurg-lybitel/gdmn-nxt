import style from './chart-donut.module.less';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import { Box, Stack, Typography, useMediaQuery, useTheme, Theme } from '@mui/material';
import { useGetKanbanDealsQuery } from '../../../features/kanban/kanbanApi';
import { makeStyles } from '@mui/styles';
import { Skeleton } from '@mui/material';
import { useState } from 'react'

const ChartSkeleton = () => {
  return(
    <div style={{display:'flex', height:'100%'}}>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',marginBottom: '49px' }}>
        <Skeleton variant="text" height={'30px'} width={'135px'} />
      </div>
      <div style={{ display: 'flex', marginBottom: '35px', flexDirection:'column' }}>
        <Skeleton variant="text" height={'40px'} width={'180px'} style={{marginBottom:'5px'}} />
        <Skeleton variant="text" height={'40px'} width={'180px'} style={{marginBottom:'5px'}} />
        <Skeleton variant="text" height={'40px'} width={'180px'} style={{marginBottom:'5px'}} />
        <Skeleton variant="text" height={'40px'} width={'180px'} style={{marginBottom:'5px'}} />
        <Skeleton variant="text" height={'40px'} width={'180px'} style={{marginBottom:'5px'}} />
      </div>
    </div>
    <div style={{width: '100%',height: '100%',padding: '55px 10px 60px 45px'}}>
        <Skeleton variant="rectangular" width={'100%'} height={'100%'}/>
    </div>
    </div>
  )
}

/* eslint-disable-next-line */
export interface ChartDonutProps {}

export function ChartDonut(props: ChartDonutProps) {
  const theme = useTheme();
  const matchDownXl = useMediaQuery(theme.breakpoints.down('xl'));

  const { data: stages, isLoading: stagesIsLoading, refetch } = useGetKanbanDealsQuery({ userId: -1 });

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
        colors: theme.palette.text.primary,
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
      <Stack direction="column" spacing={3} p={2} flex={1} display="flex" style={{ maxWidth: '100%', paddingLeft: stagesIsLoading ? '15.8px' : 0 }}>
        {stagesIsLoading
          ? <ChartSkeleton />
          : <>
            <Typography variant="h1" style={{paddingLeft:'15.8px'}}>Статус сделок</Typography>
            <Box flex={1} >
              <Chart
                style={{paddingLeft:'1px'}}
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
