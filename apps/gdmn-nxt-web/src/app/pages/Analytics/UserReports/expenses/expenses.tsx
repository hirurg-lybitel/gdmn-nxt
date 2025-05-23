import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { DateRangePicker, PickersShortcutsItem } from '@mui/x-date-pickers-pro';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './expenses.module.less';
import { useCallback, useMemo, useState } from 'react';
import { DateRange } from '@mui/lab';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import dayjs, { Dayjs } from 'dayjs';
import { sortFields } from './constants';
import { ExpensesFilter } from './expenses-filter/expenses-filter';
import ExpensesReport from './expenses-report/expenses-report';
import { useGetExpensesQuery } from 'apps/gdmn-nxt-web/src/app/features/reports/reportsApi';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';
import CustomDateRangePicker from '@gdmn-nxt/components/CustomDateRangePicker/CustomDateRangePicker';

const shortcutsItems: PickersShortcutsItem<DateRange<Date>>[] = [
  {
    label: 'Текущий месяц',
    getValue: () => {
      const today = dayjs();
      return [today.startOf('month').toDate(), today.endOf('month').toDate()];
    },
  },
  {
    label: 'Следующий месяц',
    getValue: () => {
      const today = dayjs();
      const startOfNextMonth = today.endOf('month').add(1, 'day');
      return [startOfNextMonth.toDate(), startOfNextMonth.endOf('month').toDate()];
    },
  },
  {
    label: 'Предыдущий месяц',
    getValue: () => {
      const today = dayjs();
      const startOfLastMonth = today.subtract(1, 'month').startOf('month');
      return [startOfLastMonth.toDate(), startOfLastMonth.endOf('month').toDate()];
    },
  },
  {
    label: 'Текущий год',
    getValue: () => {
      const today = dayjs();
      return [today.startOf('year').toDate(), today.endOf('year').toDate()];
    },
  },
  {
    label: 'Следующий год',
    getValue: () => {
      const today = dayjs();
      const startOfNextMonth = today.endOf('year').add(1, 'day');
      return [startOfNextMonth.toDate(), startOfNextMonth.endOf('year').toDate()];
    },
  },
  {
    label: 'Предыдущий год',
    getValue: () => {
      const today = dayjs();
      const startOfLastMonth = today.subtract(1, 'year').startOf('year');
      return [startOfLastMonth.toDate(), startOfLastMonth.endOf('year').toDate()];
    },
  },
  { label: 'Сбросить', getValue: () => [null, null] },
];

export interface ExpensesProps {}

export function Expenses(props: ExpensesProps) {
  const [generate, setGenerate] = useState(false);
  const [onDate, setOnDate] = useState<DateRange<Date> | undefined>();

  const filterEntityName = 'expenses';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);
  const defaultFilterOptions = { sortField: sortFields[0].value, sort: sortFields[0].sort };
  const [filtersIsLoading] = useFilterStore(filterEntityName, defaultFilterOptions);

  const show = generate && !!onDate && !!onDate[0] && !!onDate[1];

  const options = useMemo(() => {
    const filter = { ...filterData };
    const sort = { field: filter.sortField, sort: filter.sort };
    delete filter['sortField'];
    delete filter['sort'];
    return {
      ...filter,
      ...sort
    };
  }, [filterData]);

  const { data, isFetching, refetch } = useGetExpensesQuery({ onDate: onDate || [new Date(), new Date()], options }, { skip: !show });

  const dispatch = useDispatch();

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
    generate && setGenerate(false);
  }, [dispatch, generate]);

  const handleChange = useCallback((newValue: DateRange<Date> | undefined) => {
    setOnDate(newValue);
    generate && setGenerate(false);
  }, [generate]);

  const handleGenerate = useCallback(() => {
    setGenerate(true);
    generate && refetch();
  }, [generate, refetch]);

  const handelClear = useCallback(() => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: defaultFilterOptions }));
    setOnDate([null, null]);
  }, [dispatch]);

  return (
    <Stack
      direction="column"
      flex={1}
      spacing={1}
      width={'100%'}
    >
      <CustomizedCard>
        <CustomCardHeader title={'Расходы'}/>
        <Divider />
        <CardContent style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <CustomDateRangePicker
            slots={{ field: SingleInputDateRangeField }}
            label="Период"
            value={onDate}
            onChange={handleChange}
            slotProps={{
              shortcuts: {
                items: shortcutsItems,
              }
            }}
          />
          <ExpensesFilter
            filterData={filterData}
            saveFilters={saveFilters}
            disabled={filtersIsLoading}
          />
        </CardContent>
        <Divider />
        <CardActions style={{ padding: '16px' }}>
          <Stack
            direction="row"
            spacing={2}
            flex={1}
          >
            <Box flex={1} />
            <Button
              onClick={handelClear}
              variant="outlined"
            >
              Очистить
            </Button>
            <Button
              variant="contained"
              disabled={!onDate?.[0] || !onDate?.[1] || filtersIsLoading}
              onClick={handleGenerate}
            >
              Сформировать
            </Button>
          </Stack>
        </CardActions>
      </CustomizedCard>
      {show ? <ExpensesReport data={data} isFetching={isFetching} /> : null}
    </Stack>
  );
}

export default Expenses;
