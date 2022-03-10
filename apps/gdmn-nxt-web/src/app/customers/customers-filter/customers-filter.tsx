import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, Dialog, Paper, Slide, Stack, TextField, useMediaQuery, useTheme } from '@mui/material';
import CustomizedCard from '../../components/customized-card/customized-card';
import CustomizedDialog from '../../components/customized-dialog/customized-dialog';
import { makeStyles } from '@mui/styles';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import './customers-filter.module.less';
import { useGetDepartmentsQuery } from '../../features/departments/departmentsApi';
import { useGetCustomerContractsQuery } from '../../features/customer-contracts/customerContractsApi';
import { useGetGroupsQuery } from '../../features/contact/contactGroupApi';
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { IContactHierarchy, ILabelsContact } from '@gsbelarus/util-api-types';


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

export interface IFilteringData {
  [name: string] : any[];
}
export interface CustomersFilterProps {
  open: boolean;
  width?: string;
  onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  filteringData: IFilteringData;
  onFilteringDataChange: (arg: IFilteringData) => void;
}

export function CustomersFilter(props: CustomersFilterProps) {
  const {
    open,
    width="300px",
    onClose,
    filteringData,
    onFilteringDataChange
  } = props;

  const classes = useStyles();

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery();
  const { data: customerContracts, isFetching: customerContractsIsFetching } = useGetCustomerContractsQuery();
  const { data: labels, isFetching: labelsIsFetching} = useGetGroupsQuery();

  const handleOnChange = (entity: string, value: any) => {
    let newObject = Object.assign({}, filteringData);
    delete newObject[entity];

    onFilteringDataChange(Object.assign(newObject, {[entity]: value}));
  };

  function Filter(){
    return(
      <CustomizedCard
        borders
        boxShadows={open}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: width
        }}
      >
        <CardContent style={{ flex: 1}}>
          <Stack spacing={4}>
            <Autocomplete
              multiple
              limitTags={2}
              disableCloseOnSelect
              options={departments || []}
              onChange={(e, value) => handleOnChange('DEPARTMENTS', value)}
              value={
                departments?.filter(department => filteringData && (filteringData['DEPARTMENTS'])?.find((el: any) => el.ID === department.ID ))
              }
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
              onChange={(e, value) => handleOnChange('CONTRACTS', value)}
              value={
                customerContracts?.filter(customerContract => filteringData && (filteringData['CONTRACTS'])?.find((el: any) => el.ID === customerContract.ID ))
              }
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
              //style={{ width: '100px' }}
              //fullWidth
              multiple
              limitTags={2}
              disableCloseOnSelect
              options={labels || []}
              onChange={(e, value) => handleOnChange('LABELS', value)}
              value={
                labels?.filter(label => filteringData && (filteringData['LABELS'])?.find((el: IContactHierarchy) => el.ID === label.ID ))
              }
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
        <CardActions style={{ padding: theme.spacing(2) }}>
          <Button variant='contained' fullWidth onClick={() => onFilteringDataChange({})}>Очистить</Button>
        </CardActions>
      </CustomizedCard>
    )
  };

  // return(
  //   <div></div>
  // );

  return (
    <Box flex={1} display="flex">
    {matchDownLg
      ? <CustomizedDialog
          open={open}
          onClose={onClose}
          width={width}
        >
          <Filter />
        </CustomizedDialog>
      : <Filter />}
    </Box>
  );
}

export default CustomersFilter;
