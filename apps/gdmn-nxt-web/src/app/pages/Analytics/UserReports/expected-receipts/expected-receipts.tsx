import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { DateRangePicker, PickersShortcutsItem } from '@mui/x-date-pickers-pro';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './expected-receipts.module.less';
import { useCallback, useState } from 'react';
import ExpectedReceiptsReport from './expected-receipts-report/expected-receipts-report';
import { DateRange } from '@mui/lab';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { useFilterStore } from '@gdmn-nxt/helpers/hooks/useFilterStore';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import { ExpectedReceiptsFilter } from './expected-receipts-filter/expected-receipts-filter';
import { sortFields } from './constants';
import dayjs, { Dayjs } from 'dayjs';

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

export interface ExpectedReceiptsProps {}

export function ExpectedReceipts(props: ExpectedReceiptsProps) {
  const [generate, setGenerate] = useState(false);
  const [onDate, setOnDate] = useState<DateRange<Date> | undefined>();

  const filterEntityName = 'expectedReceipts';
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.[`${filterEntityName}`]);
  const [filtersIsLoading] = useFilterStore(filterEntityName, { includePerTime: true, sortField: sortFields[0].value, sort: sortFields[0].sort });

  const dispatch = useDispatch();

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ [`${filterEntityName}`]: filteringData }));
    generate && setGenerate(false);
  }, [dispatch, generate]);

  const handleChange = (newValue: DateRange<Date> | undefined) => {
    setOnDate(newValue);
    generate && setGenerate(false);
  };

  const handleGenerate = () => {
    setGenerate(true);
  };

  const handelClear = () => {
    setGenerate(false);
  };

  return (
    <Stack
      direction="column"
      flex={1}
      spacing={1}
      width={'100%'}
      className={styles.expectedreceipts}
    >
      <CustomizedCard>
        <CardHeader title={<Typography variant="pageHeader">Абоненское (Ожидаемые поступления)</Typography>} />
        <Divider />
        <CardContent style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <DateRangePicker
            label="Период"
            value={onDate}
            onChange={handleChange}
            calendars={1}
            slots={{ field: SingleInputDateRangeField }}
            slotProps={{
              shortcuts: {
                items: shortcutsItems,
              },
              textField: { variant: 'outlined' } }}
          />
          <ExpectedReceiptsFilter
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
              disabled={!onDate?.[0] || !onDate?.[1]}
              variant="outlined"
            >
                  Очистить
            </Button>
            <Button
              variant="contained"
              disabled={!onDate?.[0] || !onDate?.[1]}
              onClick={handleGenerate}
            >
                  Сформировать
            </Button>
          </Stack>
        </CardActions>

      </CustomizedCard>
      {generate && onDate && onDate[0] && onDate[1]
        ?
        <ExpectedReceiptsReport onDate={onDate} filterData={filterData} />
        : null}
    </Stack>
  );
}

export default ExpectedReceipts;
