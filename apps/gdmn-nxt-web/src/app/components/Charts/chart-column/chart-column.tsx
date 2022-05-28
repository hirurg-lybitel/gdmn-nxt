import './chart-column.module.less';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import CustomizedCard from '../../customized-card/customized-card';
import { Autocomplete, Checkbox, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useGetSumByPeriodQuery } from '../../../features/charts/chartDataApi';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { IContactWithID } from '@gsbelarus/util-api-types';
import { Box } from '@mui/system';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ChartSkeleton from '../chart-skeleton/chart-skeleton';
import LinearIndeterminate from '../../linear-indeterminate/linear-indeterminate';

interface IPeriodType {
  id: number;
  value: string;
};

const periods: IPeriodType[] = [
  {
    id: 1,
    value: 'Месяц'
  },
  {
    id: 2,
    value: 'Год'
  }
];

const generateArrayOfYears = () => {
  const max = new Date().getFullYear();
  const min = 2000;
  const years = [];

  for (let i = max; i >= min; i--) {
    years.push(i);
  };
  years.sort();

  return years;
};

const years = generateArrayOfYears();

/* eslint-disable-next-line */
export interface ChartColumnProps {}

export function ChartColumn(props: ChartColumnProps) {
  const theme = useTheme();
  const [periodType, setPeriodType] = useState<IPeriodType | undefined>(periods[0]);
  const [activeYears, setActiveYears] = useState<number[]>(years.slice(years.length - 2));
  const [department, setDepartment] = useState<IContactWithID | null>();


  interface IAnalyticsDataParams {
    departmentId?: number,
    dateBegin: number,
    dateEnd: number
  };

  const analyticsDataParams: IAnalyticsDataParams = {
    dateBegin: new Date(activeYears.slice(0, 1)[0], 0, 1).getTime() || 0,
    dateEnd: new Date(activeYears.slice(-1)[0], 11, 31).getTime() || 0
  };

  if (department) analyticsDataParams.departmentId = department.ID;

  const {
    data: analyticsData,
    isLoading: analyticsDataIsLoading,
    isFetching: analyticsDataIsFetching,
    refetch: analyticsDataRefetch,
  } = useGetSumByPeriodQuery(analyticsDataParams);
  const { data: departments, isFetching: departmentsIsFetching, refetch: departmentsRefetch } = useGetDepartmentsQuery();

  interface IMapOfArrays {
    [key: string]: number;
  };

  interface IMapOfChartData {
    [key: string]: IMapOfArrays;
  };

  const seriesMap: IMapOfChartData = {};

  const initialSeries: IMapOfArrays = {};

  if (periodType?.id === 1) {
    for (let index = 0; index < 12; index++) {
      initialSeries[index] = 0;
    };
  } else {
    initialSeries[0] = 0 ;
    activeYears.forEach(year =>
      seriesMap[year] = { ...initialSeries }
    );
  };

  analyticsData?.forEach(el => {
    const year = el.ONDATE.getFullYear();
    const month =
      periodType?.id === 1
        ? el.ONDATE.getMonth()
        : 0;

    if (activeYears.includes(year)) {
      if (seriesMap[year]) {
        if (!isNaN(seriesMap[year][month])) {
          seriesMap[year][month] = Math.round((seriesMap[year][month] + el.AMOUNT) * 100) / 100;
        } else {
          seriesMap[year][month] = el.AMOUNT;
        };
      } else {
        seriesMap[year] = { ...initialSeries, [month]: el.AMOUNT };
      };
    }
  });

  const series: {name?: string, data: number[]}[] = [];

  if (periodType?.id === 1) {
    for (const [key, value] of Object.entries(seriesMap)) {
      series.push({ name: key, data: Object.values(value) });
    };
  } else {
    const seriesData: number[] = [];

    for (const [key, value] of Object.entries(seriesMap)) {
      seriesData.push(Number(Object.values(value)));
    };

    series.push({ data: seriesData });
  };

  const chartCategories: string[] =
    periodType?.id === 1
      ? ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      : activeYears.map(el => el.toString());


  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      id: 'column-bar',
      stacked: false,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true
      }
    },
    noData: {
      text: 'Нет данных',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        fontSize: '20px',
      }
    },
    xaxis: {
      categories: chartCategories,
      labels: {
        formatter: (value) => (
          isNaN(Number(value)) ? value : Number(value).toLocaleString()
        )
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => {
          return value.toLocaleString();
        }
      }
    },
    tooltip: {
      theme: 'light'
    },
    plotOptions: {
      bar: {
        horizontal: periodType?.id === 2,
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
    series
  };

  return (
    <CustomizedCard
      borders
      boxShadows
      style={{
        flex: 1,
        display: 'flex'
      }}
    >
      <Stack direction="column" spacing={3} p={2} flex={1} display="flex">
        {analyticsDataIsLoading
          ? <ChartSkeleton />
          : <>
            <Stack direction="row" spacing={1}>
              <Typography
                variant="h1"
                onClick={() => {
                  analyticsDataRefetch();
                  departmentsRefetch();
                }}
              >Продажи по месяцам</Typography>
              <Box flex={1} />
              <Autocomplete
                style={{
                  width: '200px'
                }}
                options={departments || []}
                onChange={(e, value) => setDepartment(value)}
                value={department ? department : null}
                getOptionLabel={option => option.NAME}
                renderOption={(props, option) => (
                  <li {...props} key={option.ID}>
                    {option.NAME}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Все отделы"
                  />
                )}
              />
              <TextField
                style={{
                  width: '100px'
                }}
                select
                value={periodType?.value}
                onChange={(e) => setPeriodType(periods.find(el => el.value === e.target.value))}
              >
                {periods.map((option: IPeriodType) => (
                  <MenuItem key={option.id} value={option.value}>
                    {option.value}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Box height="5px">
              <LinearIndeterminate open={analyticsDataIsFetching} />
            </Box>
            <Chart
              options={chartOptions}
              series={chartData.series}
              type="bar"
            />
            <Autocomplete
              multiple
              disableCloseOnSelect
              loading={departmentsIsFetching}
              options={[...years].sort((a, b) => b - a) || []}
              onChange={(e, value) => {
                value.sort();
                setActiveYears(value);
              }}
              value={activeYears}
              getOptionLabel={option => option.toString()}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Укажите годы аналитики"
                />
              )}
            />
          </>
        }
      </Stack>
    </CustomizedCard>
  );
};

export default ChartColumn;
