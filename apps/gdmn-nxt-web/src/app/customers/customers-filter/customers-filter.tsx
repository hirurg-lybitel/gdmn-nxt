import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, Dialog, InputAdornment, List, ListItem, Paper, RadioGroup, Slide, Stack, Switch, TextField, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
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
import { CustomerSelect } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/customer-select';
import { LabelsSelect } from '@gdmn-nxt/components/Labels/labels-select';
import TagIcon from '@mui/icons-material/Tag';
import { DepartmentsSelect } from '@gdmn-nxt/components/departments-select/departments-select';
import { ContactsSelect } from '@gdmn-nxt/components/contacts-select/contacts-select';

const useStyles = makeStyles((theme: Theme) => ({
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
  [name: string]: any;
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
          <Stack spacing={2}>
            <Box>
              <DepartmentsSelect
                multiple
                limitTags={2}
                disableCloseOnSelect
                value={filteringData.DEPARTMENTS}
                onChange={(value) => handleOnChange('DEPARTMENTS', value)}
              />
              <Stack
                direction="row"
                alignItems="center"
                paddingLeft={2}
              >
                <Tooltip arrow title="Содержит все выбранные отделы">
                  <Typography variant="caption">И</Typography>
                </Tooltip>
                <Switch
                  className={classes.switchButton}
                  color="default"
                  name="DEPARTMENTS"
                  onChange={handleMethodOnChange}
                  checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)['DEPARTMENTS'] === 'OR' : false}
                />
                <Tooltip arrow title="Содержит один из выбранных отделов">
                  <Typography variant="caption">Или</Typography>
                </Tooltip>
              </Stack>
            </Box>
            <Box>
              <ContactsSelect
                multiple
                limitTags={2}
                value={filteringData.CONTRACTS}
                onChange={(value) => handleOnChange('CONTRACTS', value)}
                disableCloseOnSelect
              />
              <Stack
                direction="row"
                alignItems="center"
                paddingLeft={2}
              >
                <Tooltip arrow title="Содержит все выбранные заказы">
                  <Typography variant="caption">И</Typography>
                </Tooltip>
                <Switch
                  className={classes.switchButton}
                  color="default"
                  name="CONTRACTS"
                  onChange={handleMethodOnChange}
                  checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)['CONTRACTS'] === 'OR' : false}
                />
                <Tooltip arrow title="Содержит один из выбранных заказов">
                  <Typography variant="caption">Или</Typography>
                </Tooltip>
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
              <Stack
                direction="row"
                alignItems="center"
                paddingLeft={2}
              >
                <Tooltip arrow title="Содержит все выбранные виды работ">
                  <Typography variant="caption">И</Typography>
                </Tooltip>
                <Switch
                  className={classes.switchButton}
                  color="default"
                  name="WORKTYPES"
                  onChange={handleMethodOnChange}
                  checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)['WORKTYPES'] === 'OR' : false}
                />
                <Tooltip arrow title="Содержит один из выбранных видов работ">
                  <Typography variant="caption">Или</Typography>
                </Tooltip>
              </Stack>
            </Box>
            <LabelsSelect
              onChange={(value) => handleOnChange('LABELS', value)}
              labels={filteringData?.LABELS as ILabel[] ?? []}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="end">
                    <TagIcon />
                  </InputAdornment>
                ),
              }}
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
