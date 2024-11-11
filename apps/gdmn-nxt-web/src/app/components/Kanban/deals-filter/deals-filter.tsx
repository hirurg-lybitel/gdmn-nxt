import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import CustomizedCard from '../../Styled/customized-card/customized-card';
import CustomizedDialog from '../../Styled/customized-dialog/customized-dialog';
import styles from './deals-filter.module.less';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import filterOptions from '../../helpers/filter-options';
import { useGetCustomersQuery } from '../../../features/customer/customerApi_new';
import { useEffect, useMemo, useState } from 'react';
import { ICustomer } from '@gsbelarus/util-api-types';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import { useGetEmployeesQuery } from '../../../features/contact/contactApi';
import { DepartmentsSelect } from '@gdmn-nxt/components/departments-select/departments-select';
import { CustomerSelect } from '../kanban-edit-card/components/customer-select';
import { EmployeesSelect } from '@gdmn-nxt/components/employees-select/employees-select';

export interface IFilteringData {
  [name: string]: any;
}

export interface DealsFilterProps {
  open: boolean;
  width?: string;
  onClose?: (event?: object) => void;
  filteringData: IFilteringData;
  onFilteringDataChange: (arg: IFilteringData) => void;
  onFilterClear: () => void;
}

export function DealsFilter(props: DealsFilterProps) {
  const {
    open,
    width = '400px',
    onClose,
    filteringData,
    onFilteringDataChange,
    onFilterClear
  } = props;

  const { data: employees = [], isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const { data, isFetching: customerFetching } = useGetCustomersQuery();
  const { data: departments, isFetching: departmentsFetching } = useGetDepartmentsQuery();
  const customers: ICustomer[] = useMemo(() => [...data?.data || []], [data?.data]);

  const handleOnChange = (entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];
    onFilteringDataChange({ ...newObject, ...(value?.toString().length > 0 && !!value ? { [entity]: value } : {}) });
  };

  const [dealNumber, setDealNumber] = useState<string>(filteringData?.dealNumber);
  const [requestNumber, setRequestNumber] = useState<string>(filteringData?.requestNumber);

  useEffect(() => {
    setDealNumber(filteringData?.dealNumber || '');
  }, [filteringData?.dealNumber]);

  /** Debouncing enter deal number */
  useEffect(() => {
    if (!open) return;

    const sendRequestNumber = setTimeout(() => {
      handleOnChange('dealNumber', dealNumber);
    }, 2000);

    return () => clearTimeout(sendRequestNumber);
  }, [dealNumber]);

  useEffect(() => {
    setRequestNumber(filteringData?.requestNumber || '');
  }, [filteringData?.requestNumber]);

  /** Debouncing enter request number */
  useEffect(() => {
    if (!open) return;

    const sendRequestNumber = setTimeout(() => {
      handleOnChange('requestNumber', requestNumber);
    }, 2000);

    return () => clearTimeout(sendRequestNumber);
  }, [requestNumber]);

  return (
    <CustomizedDialog
      open={open}
      onClose={onClose}
      width={width}
    >
      {/* <Filter /> */}
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
            <TextField
              label="Номер заявки"
              value={requestNumber || ''}
              onChange={(e) => setRequestNumber(e.target.value)}
            />
            <TextField
              label="Номер сделки"
              value={dealNumber || ''}
              onChange={(e) => /^\d*$/.test(e.target.value) && setDealNumber(e.target.value)}
            />
            <CustomerSelect
              multiple
              limitTags={2}
              value={filteringData?.customers ?? []}
              onChange={(value) => handleOnChange('customers', value)}
            />
            <DepartmentsSelect
              multiple
              limitTags={2}
              value={filteringData?.departments}
              onChange={(value) => handleOnChange('departments', value)}
              label="Подразделение"
              placeholder="Выберите Подразделение"
            />
            <EmployeesSelect
              value={filteringData?.performers}
              onChange={(value) => handleOnChange('performers', value)}
              multiple
              limitTags={2}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filteringData?.isCreator ?? false}
                  onChange={(e) => handleOnChange('isCreator', e.target.checked)}
                />
              }
              label="Я постановщик"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filteringData?.isPerformer ?? false}
                  onChange={(e) => handleOnChange('isPerformer', e.target.checked)}
                />
              }
              label="Я исполнитель"
            />
          </Stack>
        </CardContent>
        <CardActions
          style={{
            padding: '16px'
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onFilterClear();
              setDealNumber('');
              onClose && onClose();
            }}
          >
            Очистить
          </Button>
        </CardActions>
      </CustomizedCard>
    </CustomizedDialog>
  );
}

export default DealsFilter;
