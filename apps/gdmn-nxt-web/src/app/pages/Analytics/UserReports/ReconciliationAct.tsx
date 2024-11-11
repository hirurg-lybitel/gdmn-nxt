import { DateRangePicker, DateRangePickerProps } from '@mui/x-date-pickers-pro/DateRangePicker';
import { Autocomplete, Box, Button, CardActions, CardContent, CardHeader, createFilterOptions, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { Fragment, useMemo, useRef, useState } from 'react';
import { IContactWithLabels, ICustomer } from '@gsbelarus/util-api-types';
import ReconciliationStatement from '../../../reconciliation-statement/reconciliation-statement';
import { useParams } from 'react-router-dom';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import ScrollToTop from '../../../components/scroll-to-top/scroll-to-top';
import { DateRange } from '@mui/x-date-pickers-pro';
import { CustomerSelect } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/customer-select';


const filterOptions = createFilterOptions({
  matchFrom: 'any',
  limit: 50,
  stringify: (option: IContactWithLabels) => option.NAME,
});


interface IReconciliationAct {
  customerId?: number;
}

interface IInputParams {
  cutomerId: number | null;
  dateBegin: Date | null;
  dateEnd: Date | null;
}

interface IInitState {
  cutomerId: number | null;
  dates: DateRange<Date>;
}
const initState: IInitState = {
  cutomerId: null,
  dates: [new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1), new Date()]
};

export const ReconciliationAct = (props: IReconciliationAct) => {
  const { customerId: id } = useParams();

  const inCustomerId = Number(id);

  const [customerId, setCustomerId] = useState(inCustomerId ? inCustomerId : initState.cutomerId);
  const [dates, setDates] = useState <DateRange<Date>>(initState.dates);

  const [generate, setGenerate] = useState(false);
  const [inputParams, setInputParams] = useState<IInputParams>();

  const { data, isFetching: customerFetching } = useGetCustomersQuery();
  const customers: ICustomer[] = useMemo(() => [...(data?.data || [])], [data?.data]);

  const handleGenerate = () => {
    setInputParams((prevState) => ({
      ...prevState,
      cutomerId: customerId,
      dateBegin: (dates)[0],
      dateEnd: (dates)[1],
    }));

    setGenerate(true);
  };

  const handelClear = () => {
    setDates(initState.dates);
    setCustomerId(initState.cutomerId);
    setGenerate(false);
  };

  return (
    <Box flex="1">
      <Stack direction="column" spacing={2}>
        <CustomizedCard>
          <CardHeader title={<Typography variant="pageHeader">Акт сверки</Typography>} />
          <Divider />
          <CardContent>
            <Grid
              container
              spacing={2}
              direction={'column'}
            >
              <Grid
                item
                md={6}
                sx={{ width: 'calc(50% - 12px)' }}
              >
                <CustomerSelect
                  value={customers?.find(customer => customer.ID === customerId) || null}
                  onChange={(value) => {
                    generate && setGenerate(false);
                    setCustomerId(value?.ID || null);
                  }}
                />
              </Grid>
              <Grid item>
                <DateRangePicker
                  // startText="Начало периода"
                  // endText="Конец периода"
                  value={dates}
                  onChange={setDates}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions style={{ padding: '16px' }}>
            <Grid
              container
              direction={'row-reverse'}
              spacing={2}
            >
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleGenerate}
                  disabled={!customerId}
                >
                  Сформировать
                </Button>
              </Grid>
              <Grid item>
                <Button onClick={handelClear} variant="outlined">
                  Очистить
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </CustomizedCard>

        {generate
          ? <CustomizedCard
            sx={{ p: 2 }}
            >
            <ReconciliationStatement
              custId={Number(inputParams?.cutomerId)}
              dateBegin={inputParams?.dateBegin}
              dateEnd={inputParams?.dateEnd}
            />
          </CustomizedCard>
          : null}
      </Stack>
      <ScrollToTop />
    </Box>
  );
};

export default ReconciliationAct;
