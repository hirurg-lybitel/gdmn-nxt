import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
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
        <CardHeader title={<Typography variant="pageHeader">Ожидаемые поступления</Typography>} />
        <Divider />
        <CardContent style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <DateRangePicker
            label="Период"
            value={onDate}
            onChange={handleChange}
            calendars={1}
            slots={{ field: SingleInputDateRangeField }}
            slotProps={{ textField: { variant: 'outlined' } }}
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
