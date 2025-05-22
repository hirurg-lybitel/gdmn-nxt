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
import { DateRange } from '@mui/x-date-pickers-pro';
import { WorktypesSelect } from '@gdmn-nxt/components/worktypes-select/worktypes-select';
import { ContractsSelect } from '@gdmn-nxt/components/selectors/contracts-select/contracts-select';
import { DepartmentsSelect } from '@gdmn-nxt/components/selectors/departments-select/departments-select';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import CustomCardHeader from '@gdmn-nxt/components/customCardHeader/customCardHeader';

interface IInitState {
  cutomerId: number | null;
  dates: DateRange<Date>;
}
const initState: IInitState = {
  cutomerId: null,
  dates: [new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1), new Date()]
};

export default function TopEarningPage() {
  const [generate, setGenerate] = useState(false);
  const [inputParams, setInputParams] = useState<ITopEarningParams>();
  const [dates, setDates] = useState<DateRange<Date>>(initState.dates);
  const [customerCount, setCustomerCount] = useState(10);
  const [selectedDep, setSelectedDep] = useState<IContactWithID | null>(null);
  const [selectedConstract, setSelectedConstract] = useState<ICustomerContract | null>(null);
  const [selectedWorkType, setSelectedWorkType] = useState<IWorkType | null>(null);

  const { data: departments, isFetching: departmentsFetching } = useGetDepartmentsQuery();
  const { data: contracts, isFetching: contractsFetching } = useGetCustomerContractsQuery();
  const { data: workTypes, isFetching: workTypesFetching } = useGetWorkTypesQuery({
    contractJob: selectedConstract ? [selectedConstract.ID] : undefined
  });

  // eslint-disable-next-line react/display-name
  const renderOption = (fieldName: string) => (props: any, option: any) =>
    <li {...props} key={option.ID}>
      {option[fieldName]}
    </li>;

  const handleGenerate = () => {
    setInputParams((prevState) => ({
      dates: dates as DateRangePickerProps<Date>,
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

  const [ListboxComponent] = useAutocompleteVirtualization();

  return (
    <>
      <Stack
        direction="column"
        flex={1}
        spacing={2}
      >
        <CustomizedCard>
          <CustomCardHeader title={'ТОП по выручке'} />
          <Divider />
          <CardContent>
            <Grid
              container
              direction="column"
              spacing={2}
            >
              <Grid item>
                <DateRangePicker
                  value={dates}
                  onChange={setDates}
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
                direction={{ xs: 'column', md: 'row' }}
              >
                <Grid item xs={4}>
                  <DepartmentsSelect
                    value={selectedDep}
                    onChange={value => setSelectedDep(value as IContactWithID)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ContractsSelect
                    value={selectedConstract || null}
                    onChange={(value) => {
                      setSelectedConstract(value as ICustomerContract);
                      setSelectedWorkType(null);
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete
                    ListboxComponent={ListboxComponent}
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
