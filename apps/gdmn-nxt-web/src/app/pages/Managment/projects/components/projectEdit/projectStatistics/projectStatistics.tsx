import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { useGetStatisticsQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';
import styles from './projectStatistics.module.less';
import { Box, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, useTheme } from '@mui/material';
import { IProjectStatistics } from '@gsbelarus/util-api-types';
import dayjs, { Duration } from '@gdmn-nxt/dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Sort, SortByAlpha } from '@mui/icons-material';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import ButtonDateRangePicker from '@gdmn-nxt/components/button-date-range-picker';
import { DateRange } from '@mui/x-date-pickers-pro';
import CustomNoData from '@gdmn-nxt/components/Styled/Icons/CustomNoData';

interface IProjectStatisticsProps {
  projectId?: number;
}

interface IChartDataItem {
  name: string;
  billable: string;
  nonbillable: string;
  total: string;
}

export default function ProjectStatistics({ projectId }: Readonly<IProjectStatisticsProps>) {
  const theme = useTheme();

  const [sortBy, setSortBy] = useState<'name' | 'duration'>('duration');
  const today = dayjs();
  const [dateRange, setDateRange] = useState<DateRange<Date>>([today.startOf('year').toDate(), today.endOf('year').toDate()]);

  const { data: statistics = [] } = useGetStatisticsQuery({
    projectId: projectId ?? -1,
    options: {
      filter: {
        ...(dateRange[0] && dateRange[1] ? { period: [dateRange[0].getTime(), dateRange[1].getTime()] } : {})
      }
    }
  }, {
    skip: !projectId,
    refetchOnMountOrArgChange: true
  });

  const chartData = useMemo((): IChartDataItem[] => {
    const processedData = statistics.map(stat => ({
      name: stat.name,
      billable: stat.billableDuration || 'PT0M',
      nonbillable: stat.nonBillableDuration || 'PT0M',
      total: stat.totalDuration || 'PT0M'
    }));

    return sortBy === 'name'
      ? processedData.sort((a, b) => a.name.localeCompare(b.name))
      : processedData.sort((a, b) =>
        dayjs.duration(b.total).asMinutes() - dayjs.duration(a.total).asMinutes()
      );
  }, [statistics, sortBy]);

  const totalDurations = useMemo(() => {
    const billable = chartData.reduce((total, item) => {
      return total.add(dayjs.duration(item.billable));
    }, dayjs.duration(0));

    const nonbillable = chartData.reduce((total, item) => {
      return total.add(dayjs.duration(item.nonbillable));
    }, dayjs.duration(0));

    const total = billable.add(nonbillable);

    return { billable, nonbillable, total };
  }, [chartData]);

  const formatDuration = (duration: Duration): string => {
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const pieChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      background: theme.palette.background.paper,
    },
    theme: {
      mode: theme.palette.mode,
      palette: 'palette3',
    },
    labels: ['Оплачиваемые', 'Неоплачиваемые'],
    legend: {
      position: 'top',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true
            },
            value: {
              show: true,
              formatter: (val) => formatDuration(dayjs.duration(Number(val), 'minutes'))
            },
            total: {
              show: true,
              label: 'Всего',
              formatter: (w) => {
                const total = w.config.series[0] + w.config.series[1];
                return formatDuration(dayjs.duration(total, 'minutes'));
              }
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value: number) => formatDuration(dayjs.duration(value, 'minutes'))
      }
    }
  };

  const barChartOptions: ApexOptions = {
    theme: {
      mode: theme.palette.mode,
      palette: 'palette3',
    },
    chart: {
      background: theme.palette.background.paper,
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: false
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: true
      },
    },
    xaxis: {
      type: 'category',
      categories: chartData.map(item => item.name),
      labels: {
        formatter: (value: string) => `${Math.floor(dayjs.duration(Number(value), 'minutes').asHours())} ч.`
      }
    },
    yaxis: {
      labels: {
        padding: 10,
        maxWidth: 500,
        align: 'left',
        style: {
          fontSize: '0.875rem',
        }
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value: number) => formatDuration(dayjs.duration(value, 'minutes'))
      },
    },
    legend: {
      position: 'top',
    },
    dataLabels: {
      textAnchor: 'start',
      // offsetX: 10,
      distributed: true,
      formatter: (value: number) => formatDuration(dayjs.duration(value, 'minutes'))
    }
  };

  const handleSortChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSort: 'name' | 'duration' | null
  ) => {
    if (newSort !== null) {
      setSortBy(newSort);
    }
  };

  const dateRangeOnChange = (value: DateRange<Date>) => {
    setDateRange([...value]);
  };

  return (
    <Stack
      spacing={2}
      flex={1}
    >
      <Stack direction="row" spacing={1}>
        <ButtonDateRangePicker
          value={dateRange}
          onChange={dateRangeOnChange}
        />
        <Box flex={1} />
        <Stack
          direction="row"
        >
          <ToggleButtonGroup
            size="small"
            value={sortBy}
            exclusive
            onChange={handleSortChange}
            sx={{
              height: '30px',
            }}
          >
            <Tooltip title="Сортировать по названию">
              <ToggleButton value="name" aria-label="sort by name">
                <SortByAlpha />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Сортировать по длительности">
              <ToggleButton value="duration" aria-label="sort by duration">
                <Sort />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

        </Stack>
      </Stack>
      {statistics.length === 0
        ? <Box flex={1} alignContent="center"><CustomNoData /></Box>
        : (
          <CustomizedScrollBox container={{ style: { marginRight: -20 } }} style={{ paddingRight: 20, paddingBottom: 1 }}>
            <CustomizedCard borders sx={{ flex: 1, minHeight: '80%' }}>
              <Box
                flex={1}
                position="relative"
                paddingTop={0.5}
                sx={{
                  '& .my-apexcharts-yaxis-label': {
                    '& tspan': {
                      backgroundColor: 'green'
                    },
                    backgroundColor: 'red'
                  }
                }}
              >
                <ReactApexChart
                  options={barChartOptions}
                  series={[
                    {
                      name: 'Оплачиваемые',
                      data: chartData.map(item => dayjs.duration(item.billable).asMinutes())
                    },
                    {
                      name: 'Неоплачиваемые',
                      data: chartData.map(item => dayjs.duration(item.nonbillable).asMinutes())
                    }
                  ]}
                  type="bar"
                  width="100%"
                  height="100%"
                />
              </Box>
            </CustomizedCard>

            <Box height={20} />

            <CustomizedCard borders>
              <Box height={300} paddingTop={1}>
                <ReactApexChart
                  options={pieChartOptions}
                  series={[
                    totalDurations.billable.asMinutes(),
                    totalDurations.nonbillable.asMinutes()
                  ]}
                  type="donut"
                  width="100%"
                  height="100%"
                />
              </Box>
            </CustomizedCard>
          </CustomizedScrollBox>) }
    </Stack>
  );
}
