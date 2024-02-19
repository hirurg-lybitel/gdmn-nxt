import { IContactWithID, ICustomerContract, IWorkType } from '@gsbelarus/util-api-types';
import { Autocomplete, Box, Button, CardActions, CardContent, CardHeader, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { DateRangePickerProps, DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { useState } from 'react';
import TopEarning, { ITopEarningParams } from '../../../components/Reports/top-earning/top-earning';
import ScrollToTop from '../../../components/scroll-to-top/scroll-to-top';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { useGetCustomerContractsQuery } from '../../../features/customer-contracts/customerContractsApi';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { useGetWorkTypesQuery } from '../../../features/work-types/workTypesApi';

interface IInitState {
  cutomerId: number | null;
  dates: DateRangePickerProps<Date>;
}
const initState: IInitState = {
  cutomerId: null,
  dates: [new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1), new Date()] as DateRangePickerProps<Date>
};

export default function TopEarningPage() {
  const [generate, setGenerate] = useState(false);
  const [inputParams, setInputParams] = useState<ITopEarningParams>();
  const [dates, setDates] = useState<DateRangePickerProps<Date>>(initState.dates);
  const [customerCount, setCustomerCount] = useState(10);
  const [selectedDep, setSelectedDep] = useState<IContactWithID | null>(null);
  const [selectedConstract, setSelectedConstract] = useState<ICustomerContract | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<IWorkType | null>(null);

  const { data: departments, isFetching: departmentsFetching } = useGetDepartmentsQuery();
  const { data: contracts, isFetching: contractsFetching } = useGetCustomerContractsQuery();
  const { data: workTypes, isFetching: workTypesFetching } = useGetWorkTypesQuery({
    contractJob: selectedConstract ? [selectedConstract.ID] : undefined
  });

  const renderOption = (fieldName: string) => (props: any, option: any) => {
    return (
      <li {...props} key={option.ID}>
        {option[fieldName]}
      </li>
    );
  };

  const handleGenerate = () => {
    setInputParams((prevState) => ({
      dates,
      customerCount,
      ...(selectedDep && { depId: selectedDep.ID }),
      ...(selectedConstract && { jobId: selectedConstract.ID }),
      ...(selectedWorkType && { jobWorkId: selectedWorkType.ID })
    }));

    setGenerate(true);
  };

  const handelClear = () => {
    // setDates(initState.dates);
    // setCustomerId(initState.cutomerId);
    setGenerate(false);
  };

  return (
    <>
      <Stack
        direction="column"
        flex={1}
        spacing={2}
      >
        <CustomizedCard>
          <CardHeader title={<Typography variant="pageHeader">ТОП по выручке</Typography>} />
          <Divider />
          <CardContent>
            <Grid
              container
              direction="column"
              spacing={2}
            >
              <Grid item>
                <DateRangePicker
                  value={dates as any}
                  onChange={setDates as any}
                  slotProps={{ textField: { variant: 'outlined' } }}
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Кол-во клиентов"
                  type="number"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(Number(e.target.value))}
                />
              </Grid>
              <Grid
                item
                container
                xs={12}
                spacing={2}
                direction={{ sm: 'column', md: 'row' }}
              >
                <Grid item xs={4}>
                  <Autocomplete
                    options={departments || []}
                    getOptionLabel={option => option.NAME}
                    renderOption={renderOption('NAME')}
                    loading={departmentsFetching}
                    value={selectedDep}
                    onChange={(e, value) => setSelectedDep(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Подразделение"
                        placeholder="Выберите подразделение"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    options={contracts || []}
                    getOptionLabel={option => option.USR$NUMBER || ''}
                    renderOption={renderOption('USR$NUMBER')}
                    loading={contractsFetching}
                    value={selectedConstract || null}
                    onChange={(e, value) => {
                      setSelectedConstract(value);
                      setSelectedWorkType(null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Заказ"
                        placeholder="Выберите заказ"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    options={workTypes || []}
                    getOptionLabel={option => option.USR$NAME || ''}
                    renderOption={renderOption('USR$NAME')}
                    loading={workTypesFetching}
                    value={selectedWorkType}
                    onChange={(e, value) => setSelectedWorkType(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Вид работы"
                        placeholder="Выберите вид работы"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
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
            <TopEarning params={inputParams} />
          </CustomizedCard>
          : null}
      </Stack>
      <ScrollToTop /></>
  );
};
