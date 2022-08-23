import { DateRangePicker, DateRange } from '@mui/x-date-pickers-pro/DateRangePicker';
import { Autocomplete, Button, CardActions, CardContent, CardHeader, createFilterOptions, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { Box, useTheme } from '@mui/system';
import { Fragment, useRef, useState } from 'react';
import { IContactWithLabels } from '@gsbelarus/util-api-types';
import ReconciliationStatement from '../../../reconciliation-statement/reconciliation-statement';
import { useParams } from 'react-router-dom';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import ScrollToTop from '../../../components/scroll-to-top/scroll-to-top';


const filterOptions = createFilterOptions({
  matchFrom: 'any',
  limit: 50,
  stringify: (option: IContactWithLabels) => option.NAME,
});


interface ReconciliationAct {
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
  dates: [new Date(), new Date()]
};

export const ReconciliationAct = (props: ReconciliationAct) => {
  const { customerId: id } = useParams();

  const inCustomerId = Number(id);

  const [customerId, setCustomerId] = useState(inCustomerId ? inCustomerId : initState.cutomerId);
  const [dates, setDates] = useState<DateRange<Date>>(initState.dates);

  const [generate, setGenerate] = useState(false);
  const [inputParams, setInputParams] = useState<IInputParams>();

  const { data: customers, isFetching: customerFetching } = useGetCustomersQuery();

  const handleGenerate = () => {
    setInputParams((prevState) => ({
      ...prevState,
      cutomerId: customerId,
      dateBegin: dates[0],
      dateEnd: dates[1],
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
        <CustomizedCard borders boxShadows>
          <CardHeader title={<Typography variant="h3">Акт сверки</Typography>} />
          <Divider />
          <CardContent>
            <Grid container spacing={3} direction={'column'}>
              <Grid item md={6} sx={{ width: '50%' }}>
                <Autocomplete
                  options={customers || []}
                  filterOptions={filterOptions}
                  getOptionLabel={option => option.NAME}
                  value={customers?.find(customer => customer.ID === customerId) || null}
                  onChange={(e, value) => {
                    generate && setGenerate(false);
                    setCustomerId(value?.ID || null);
                  }}
                  renderOption={(props, option) => {
                    return (
                      <li {...props} key={option.ID}>
                        {option.NAME}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Клиент"
                      type="text"
                      name="PARENT"
                      placeholder="Выберите клиента"
                      required
                      value={customerId}
                    />
                  )
                  }
                  loading={customerFetching}
                  loadingText="Загрузка данных..."
                />
              </Grid>
              <Grid item>
                <DateRangePicker
                  // startText="Начало периода"
                  // endText="Конец периода"
                  value={dates}
                  onChange={setDates}
                  renderInput={(startProps: any, endProps: any) => (
                    <Fragment>
                      <TextField {...startProps} />
                      <Box sx={{ mx: 2 }}/>
                      <TextField {...endProps} />
                    </Fragment>
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions style={{ padding: '16px' }}>
            <Grid
              container
              direction={'row-reverse'}
              spacing={3}
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
                <Button onClick={handelClear}>
                  Очистить
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </CustomizedCard>

        {generate
          ? <CustomizedCard
            borders
            boxShadows
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
