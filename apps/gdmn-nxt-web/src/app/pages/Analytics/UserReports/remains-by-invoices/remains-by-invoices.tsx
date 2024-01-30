import { Box, Button, CardActions, CardContent, CardHeader, Divider, Stack, TextField, Typography } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers-pro';
import CustomizedCard from 'apps/gdmn-nxt-web/src/app/components/Styled/customized-card/customized-card';
import styles from './remains-by-invoices.module.less';
import { useState } from 'react';
import RemainsByInvoicesReport from '../remains-by-invoices-report/remains-by-invoices-report';

/* eslint-disable-next-line */
export interface RemainsByInvoicesProps {}

export function RemainsByInvoices(props: RemainsByInvoicesProps) {
  // const onDate = useRef();
  const [generate, setGenerate] = useState(false);
  const [onDate, setOnDate] = useState<Date | null>(
    new Date(),
  );

  const handleChange = (newValue: Date | null) => {
    setOnDate(newValue);
    generate && setGenerate(false);
  };

  const handleGenerate = () => {
    // setInputParams((prevState) => ({
    //   ...prevState,
    //   cutomerId: customerId,
    //   dateBegin: dates[0],
    //   dateEnd: dates[1],
    // }));

    // setGenerate(false);
    setGenerate(true);

    // scollToRef.current?.scrollIntoView();
  };

  const handelClear = () => {
    // setDates(initState.dates);
    // setCustomerId(initState.cutomerId);
    setGenerate(false);
  };

  return (
    <Stack direction="column" flex={1} spacing={2}>
      <CustomizedCard>
        <CardHeader title={<Typography variant="pageHeader">Остатки по расчётным счетам</Typography>} />
        <Divider />
        <CardContent>
          <DesktopDatePicker
            label="На дату"
            value={onDate}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </CardContent>
        <Divider />
        <CardActions style={{ padding: '16px' }}>
          <Stack direction="row" spacing={2} flex={1}>
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
      {generate
        ? <CustomizedCard
          style={{ padding: '16px' }}
        >
          <RemainsByInvoicesReport onDate={onDate || new Date()} />
        </CustomizedCard>
        : null}

    </Stack>
  );
}

export default RemainsByInvoices;
