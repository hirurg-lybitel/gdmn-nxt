import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, Dialog, List, ListItem, Paper, RadioGroup, Slide, Stack, Switch, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CustomizedCard from '../../components/Styled/customized-card/customized-card';
import CustomizedDialog from '../../components/Styled/customized-dialog/customized-dialog';
import { makeStyles } from '@mui/styles';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import './customers-filter.module.less';
import { useGetDepartmentsQuery } from '../../features/departments/departmentsApi';
import { useGetCustomerContractsQuery } from '../../features/customer-contracts/customerContractsApi';
import { useGetGroupsQuery } from '../../features/contact/contactGroupApi';
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';
import { IBusinessProcess, IContactHierarchy, ILabel, ILabelsContact } from '@gsbelarus/util-api-types';
import { Theme } from '@mui/material/styles';
import { useGetWorkTypesQuery } from '../../features/work-types/workTypesApi';
import { useGetLabelsQuery } from '../../features/labels';
import LabelMarker from '../../components/Labels/label-marker/label-marker';
import filterOptions from '../../components/helpers/filter-options';
import { useGetBusinessProcessesQuery } from '../../features/business-processes';

const useStyles = makeStyles((theme: Theme) => ({
  // dialog: {
  //   position: 'absolute',
  //   right: 0,
  //   margin: 0,
  //   height: '100%',
  //   maxHeight: '100%',
  //   width: 500,
  //   borderTopRightRadius: 0,
  //   borderBottomRightRadius: 0
  // },
  // label: {
  //   display: 'inline-block',
  //   fontSize: '0.625rem',
  //   fontWeight: 'bold',
  //   fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  //   textTransform: 'uppercase',
  //   border: '1px solid hsl(198, 100%, 60%)',
  //   borderRadius: '2em',
  //   backgroundColor: 'hsla(198, 100%, 72%, 0.2)',
  //   color: 'hsl(198, 100%, 60%)',
  //   padding: '2.5px 9px',
  //   margin: '0px 5px',
  //   width: 'fit-content',
  //   height: 'fit-content'
  // },
  switchButton: {
    '& .MuiButtonBase-root': {
      color: theme.palette.primary.main
    },
    '& .MuiSwitch-track': {
      backgroundColor: 'grey'
    }
  }
}));

export interface IFilteringData {
  [name: string] : any;
}
export interface CustomersFilterProps {
  open: boolean;
  width?: string;
  onClose?: (event?: {}) => void;
  filteringData: IFilteringData;
  onFilteringDataChange: (arg: IFilteringData) => void;
  onFilterClear: () => void;
}

export function CustomersFilter(props: CustomersFilterProps) {
  const {
    open,
    width = '400px',
    onClose,
    filteringData,
    onFilteringDataChange,
    onFilterClear
  } = props;

  const classes = useStyles();

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));

  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery();
  const { data: customerContracts, isFetching: customerContractsIsFetching } = useGetCustomerContractsQuery();
  // const { data: labels, isFetching: labelsIsFetching } = useGetGroupsQuery();
  const { data: businessProcesses = [], isFetching: businessProcessesFetching } = useGetBusinessProcessesQuery();
  const { data: labels, isFetching: labelsIsFetching } = useGetLabelsQuery();
  const { data: workTypes, isFetching: workTypesIsFetching } = useGetWorkTypesQuery(
    { contractJob: filteringData?.CONTRACTS?.map((el: any) => el.ID) },
    { refetchOnMountOrArgChange: true });

  const handleOnChange = (entity: string, value: any) => {
    const newObject = Object.assign({}, filteringData);
    delete newObject[entity];

    /** При очистке выбранных заказов очищаем выбранные виды работ */
    if (entity === 'CONTRACTS' && value?.length === 0) {
      delete newObject['WORKTYPES'];
    };

    /** Если были выбраны виды работ без указания заказов, то очищаем их при первичном выборе заказов */
    if (entity === 'CONTRACTS' && !newObject['CONTRACTS']) {
      delete newObject['WORKTYPES'];
    };

    onFilteringDataChange(Object.assign(newObject, value?.length > 0 ? { [entity]: value } : {}));
  };

  const handleMethodOnChange = (e: any, checked: any) => {
    const name: string = e.target.name;
    const methods: {[key: string]: any} = filteringData && { ...filteringData['METHODS'] } || {};
    delete methods[name];

    const newMethods = Object.assign(methods, { [name]: checked ? 'OR' : 'AND' });

    const newFilteringData = { ...filteringData };
    delete newFilteringData['METHODS'];

    onFilteringDataChange(Object.assign(newFilteringData, { METHODS: newMethods }));
  };

  function Filter() {
    return (
      <CustomizedCard
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: width,
        }}
      >
        <CardContent style={{ flex: 1 }}>
          <Stack spacing={3}>
            <Box>
              <Autocomplete
                multiple
                limitTags={2}
                disableCloseOnSelect
                options={departments || []}
                onChange={(e, value) => handleOnChange('DEPARTMENTS', value)}
                value={
                  departments?.filter(department => filteringData && (filteringData.DEPARTMENTS)?.find((el: any) => el.ID === department.ID))
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
              <Stack direction="row" alignItems="center" paddingLeft={2}>
                <Typography variant="caption">И</Typography>
                <Switch
                  className={classes.switchButton}
                  color="default"
                  name="DEPARTMENTS"
                  onChange={handleMethodOnChange}
                  checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)['DEPARTMENTS'] === 'OR' : false}
                />
                <Typography variant="caption">Или</Typography>
              </Stack>
            </Box>
            <Box>
              <Autocomplete
                multiple
                limitTags={2}
                disableCloseOnSelect
                options={customerContracts || []}
                onChange={(e, value) => handleOnChange('CONTRACTS', value)}
                value={
                  customerContracts?.filter(customerContract => filteringData && (filteringData.CONTRACTS)?.find((el: any) => el.ID === customerContract.ID))
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
              <Stack direction="row" alignItems="center" paddingLeft={2}>
                <Typography variant="caption">И</Typography>
                <Switch
                  className={classes.switchButton}
                  color="default"
                  name="CONTRACTS"
                  onChange={handleMethodOnChange}
                  checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)['CONTRACTS'] === 'OR' : false}
                />
                <Typography variant="caption">Или</Typography>
              </Stack>
            </Box>
            <Box>
              <Autocomplete
                multiple
                limitTags={2}
                disableCloseOnSelect
                filterOptions={filterOptions(30, 'USR$NAME')}
                options={workTypes || []}
                onChange={(e, value) => handleOnChange('WORKTYPES', value)}
                value={
                  workTypes?.filter(wt => filteringData && (filteringData['WORKTYPES'])?.find((el: any) => el.ID === wt.ID))
                }
                getOptionLabel={option => option.USR$NAME || ''}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.ID}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                      checkedIcon={<CheckBoxIcon fontSize="small" />}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.USR$NAME}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Виды работ"
                    placeholder="Выберите виды работ"
                  />
                )}
                loading={workTypesIsFetching}
                loadingText="Загрузка данных..."
              />
              <Stack direction="row" alignItems="center" paddingLeft={2}>
                <Typography variant="caption">И</Typography>
                <Switch
                  className={classes.switchButton}
                  color="default"
                  name="WORKTYPES"
                  onChange={handleMethodOnChange}
                  checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)['WORKTYPES'] === 'OR' : false}
                />
                <Typography variant="caption">Или</Typography>
              </Stack>
            </Box>
            <Autocomplete
              multiple
              limitTags={2}
              disableCloseOnSelect
              options={labels || []}
              onChange={(e, value) => handleOnChange('LABELS', value)}
              value={
                labels?.filter(label => filteringData && (filteringData.LABELS)?.find((el: ILabel) => el.ID === label.ID))
              }
              getOptionLabel={option => option.USR$NAME}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  <Stack direction="column">
                    <Stack direction="row">
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '12px',
                          mr: 1,
                          alignSelf: 'center',
                          backgroundColor: option.USR$COLOR
                        }}
                      />
                      <Box>
                        {option.USR$NAME}
                      </Box>
                    </Stack>
                    <Typography variant="caption">{option.USR$DESCRIPTION}</Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Метки"
                  placeholder="Выберите метки"
                />
              )}
              renderTags={(value: readonly ILabel[], getTagProps) =>
                value.map((option: ILabel, index: number) =>
                  <Box key={index} pr={0.5} pb={0.5}>
                    <LabelMarker label={option} {...getTagProps({ index })}/>
                  </Box>
                )
              }
              loading={labelsIsFetching}
              loadingText="Загрузка данных..."
            />
            <Autocomplete
              multiple
              limitTags={2}
              disableCloseOnSelect
              options={businessProcesses}
              onChange={(e, value) => handleOnChange('BUSINESSPROCESSES', value)}
              value={
                businessProcesses?.filter(businessProcess => filteringData && (filteringData.BUSINESSPROCESSES)?.find((el: IBusinessProcess) => el.ID === businessProcess.ID))
              }
              getOptionLabel={option => option.NAME}
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.ID}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    checked={selected}
                  />
                  {option.NAME}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Бизнес-процессы"
                  placeholder="Выберите бизнес-процессы"
                />
              )}
              loading={businessProcessesFetching}
              loadingText="Загрузка данных..."
            />
          </Stack>
        </CardContent>
        <CardActions style={{ padding: theme.spacing(2) }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onFilterClear();
              onClose && onClose();
            }}
          >
            Очистить
          </Button>
        </CardActions>
      </CustomizedCard>
    );
  };

  return (
    <Box flex={1} display="flex">
      <CustomizedDialog
        open={open}
        onClose={onClose}
        width={width}
      >
        <Filter />
      </CustomizedDialog>
    </Box>
  );

  // return (
  //   <Box flex={1} display="flex">
  //     {matchDownLg
  //       ? <CustomizedDialog
  //         open={open}
  //         onClose={onClose}
  //         width={width}
  //       >
  //         <Filter />
  //       </CustomizedDialog>
  //       : <Filter />}
  //   </Box>
  // );
}

export default CustomersFilter;
