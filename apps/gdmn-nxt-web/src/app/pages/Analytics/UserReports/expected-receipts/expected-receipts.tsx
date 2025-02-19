import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, TextField, Typography } from '@mui/material';
import { DateRangePicker, DesktopDatePicker } from '@mui/x-date-pickers-pro';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './expected-receipts.module.less';
import { useState } from 'react';
import ExpectedReceiptsReport from './expected-receipts-report/expected-receipts-report';
import { DateRange } from '@mui/lab';

export interface ExpectedReceiptsProps {}

export function ExpectedReceipts(props: ExpectedReceiptsProps) {
  const [generate, setGenerate] = useState(false);
  const [onDate, setOnDate] = useState<DateRange<Date> | undefined>();

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
      spacing={2}
      width={'100%'}
    >
      <CustomizedCard>
        <CardHeader title={<Typography variant="pageHeader">Ожидаемые поступления</Typography>} />
        <Divider />
        <CardContent>
          <DateRangePicker
            label="На дату"
            value={onDate}
            onChange={handleChange}
            calendars={1}
            slotProps={{ textField: { variant: 'outlined' } }}
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
            <Button onClick={handelClear} variant="outlined">
                  Очистить
            </Button>
            <Button
              variant="contained"
              onClick={handleGenerate}
            >
                  Сформировать
            </Button>

          </Stack>
        </CardActions>

      </CustomizedCard>
      {generate && onDate && onDate[0] && onDate[1]
        ?
        <ExpectedReceiptsReport onDate={onDate} />
        : null}
    </Stack>
  );
}

export default ExpectedReceipts;
