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
import filterOptions from '@gdmn-nxt/helpers/filter-options';
import { useGetBusinessProcessesQuery } from '../../features/business-processes';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { LabelsSelect } from '@gdmn-nxt/components/selectors/labels-select';
import TagIcon from '@mui/icons-material/Tag';
import { DepartmentsSelect } from '@gdmn-nxt/components/selectors/departments-select/departments-select';
import { ContractsSelect } from '@gdmn-nxt/components/selectors/contracts-select/contracts-select';
import { WorktypesSelect } from '@gdmn-nxt/components/worktypes-select/worktypes-select';
import { BusinessProcessesSelect } from '@gdmn-nxt/components/selectors/businessProcesses-select/businessProcesses-select';
import FilterDialog from '@gdmn-nxt/components/filter-dialog/filter-dialog';

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

  const handleOnChange = (entity: string, value: any) => {
    const newObject = Object.assign({}, filteringData);
    delete newObject[entity];

    /** При очистке выбранных заказов очищаем выбранные виды работ */
    if (entity === 'CONTRACTS' && value?.length === 0) {
      delete newObject['WORKTYPES'];
    };

    /** Если были выбраны виды работ без указания заказов, то очищаем их при первичном выборе заказов */
    if (entity === 'CONTRACTS' && !newObject?.['CONTRACTS']) {
      delete newObject['WORKTYPES'];
    };

    onFilteringDataChange(Object.assign(newObject, value?.length > 0 ? { [entity]: value } : {}));
  };

  const handleMethodOnChange = (e: any, checked: any) => {
    const name: string = e.target.name;
    const methods: { [key: string]: any; } = filteringData && { ...filteringData['METHODS'] } || {};
    delete methods[name];

    const newMethods = Object.assign(methods, { [name]: checked ? 'OR' : 'AND' });

    const newFilteringData = { ...filteringData };
    delete newFilteringData['METHODS'];

    onFilteringDataChange(Object.assign(newFilteringData, { METHODS: newMethods }));
  };

  return (
    <FilterDialog
      open={open}
      onClear={onFilterClear}
      onClose={onClose}
      width={width}
    >
      <Stack spacing={2}>
        <Box>
          <DepartmentsSelect
            multiple
            limitTags={2}
            disableCloseOnSelect
            value={filteringData?.DEPARTMENTS}
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
              checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)?.['DEPARTMENTS'] === 'OR' : false}
            />
            <Tooltip arrow title="Содержит один из выбранных отделов">
              <Typography variant="caption">Или</Typography>
            </Tooltip>
          </Stack>
        </Box>
        <Box>
          <ContractsSelect
            multiple
            limitTags={2}
            value={filteringData?.CONTRACTS}
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
          <WorktypesSelect
            multiple
            limitTags={2}
            disableCloseOnSelect
            onChange={(value) => handleOnChange('WORKTYPES', value)}
            value={filteringData?.['WORKTYPES']}
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
              checked={filteringData && filteringData['METHODS'] ? (filteringData['METHODS'] as any)?.['WORKTYPES'] === 'OR' : false}
            />
            <Tooltip arrow title="Содержит один из выбранных видов работ">
              <Typography variant="caption">Или</Typography>
            </Tooltip>
          </Stack>
        </Box>
        <LabelsSelect
          onChange={(value) => handleOnChange('LABELS', value)}
          labels={filteringData?.LABELS as ILabel[] ?? []}
          textFieldProps={{
            InputProps: {
              startAdornment: (
                <InputAdornment position="end">
                  <TagIcon />
                </InputAdornment>
              ),
            }
          }}
        />
        <BusinessProcessesSelect
          value={filteringData?.BUSINESSPROCESSES}
          onChange={value => handleOnChange('BUSINESSPROCESSES', value)}
          multiple
          limitTags={2}
          disableCloseOnSelect
        />
      </Stack>
    </FilterDialog>
  );
}

export default CustomersFilter;
