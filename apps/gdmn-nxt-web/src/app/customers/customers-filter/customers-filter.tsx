import { Autocomplete, Box, CardContent, Checkbox, Dialog, Paper, Slide, Stack, TextField, useMediaQuery, useTheme } from '@mui/material';
import CustomizedCard from '../../components/customized-card/customized-card';
import CustomizedDialog from '../../components/customized-dialog/customized-dialog';
import { makeStyles } from '@mui/styles';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import './customers-filter.module.less';
import { useGetDepartmentsQuery } from '../../features/departments/departmentsApi';
import { useGetCustomerContractsQuery } from '../../features/customer-contracts/customerContractsApi';
import { useGetGroupsQuery } from '../../features/contact/contactGroupApi';


const useStyles = makeStyles((theme) => ({
  dialog: {
    position: 'absolute',
    right: 0,
    margin: 0,
    height: '100%',
    maxHeight: '100%',
    width: 500,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  label: {
    display: 'inline-block',
    fontSize: '0.625rem',
    fontWeight: 'bold',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    textTransform: 'uppercase',
    border: '1px solid hsl(198, 100%, 60%)',
    borderRadius: '2em',
    backgroundColor: 'hsla(198, 100%, 72%, 0.2)',
    color: 'hsl(198, 100%, 60%)',
    padding: '2.5px 9px',
    margin: '0px 5px',
    width: 'fit-content',
    height: 'fit-content'
  }
}));

/* eslint-disable-next-line */
export interface CustomersFilterProps {
  open: boolean;
}

export function CustomersFilter(props: CustomersFilterProps) {
  const { open } = props;
  const classes = useStyles();

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));4

  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery();
  const { data: customerContracts, isFetching: customerContractsIsFetching } = useGetCustomerContractsQuery();
  const { data: labels, isFetching: labelsIsFetching} = useGetGroupsQuery();


  function Filter(){
    return(
      <CustomizedCard
        borders
        boxShadows
        style={{
          width: '320px'
        }}
      >
        <CardContent>
          <Stack spacing={4}>
            <Autocomplete
              multiple
              limitTags={2}
              disableCloseOnSelect
              options={departments || []}
              getOptionLabel={option => option.NAME}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.NAME}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Отдел"
                  placeholder="Выберите отделы"
                />
              )}
              loading={departmentsIsFetching}
              loadingText="Загрузка данных..."
            />
            <Autocomplete
              multiple
              limitTags={2}
              disableCloseOnSelect
              options={customerContracts || []}
              getOptionLabel={option => option.USR$NUMBER}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.USR$NUMBER}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Заказы"
                  placeholder="Выберите заказы"
                />
              )}
              loading={customerContractsIsFetching}
              loadingText="Загрузка данных..."
            />
            <Autocomplete
              multiple
              limitTags={2}
              disableCloseOnSelect
              options={labels || []}
              getOptionLabel={option => option.NAME}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  <Box className={classes.label}>{option.NAME}</Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Метки"
                  placeholder="Выберите метки"
                />
              )}
              loading={labelsIsFetching}
              loadingText="Загрузка данных..."
            />
          </Stack>
        </CardContent>
      </CustomizedCard>
    )
  };

  return (
    <Box display="flex">
    {matchDownLg
      ? <CustomizedDialog
          open={open}
        >
          <Filter />
        </CustomizedDialog>
      : <Filter />}
    </Box>
  );
}

export default CustomersFilter;
