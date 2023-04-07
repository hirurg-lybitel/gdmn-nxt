import { Autocomplete, Box, Button, CardActions, CardContent, Checkbox, Stack, TextField, Typography } from '@mui/material';
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

export interface IFilteringData {
  [name: string] : any;
}

export interface DealsFilterProps {
  open: boolean;
  width?: string;
  onClose?: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
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

  const { data, isFetching: customerFetching } = useGetCustomersQuery();
  const { data: departments, isFetching: departmentsFetching } = useGetDepartmentsQuery();
  const customers: ICustomer[] = useMemo(() => [...data?.data || []], [data?.data]);

  const handleOnChange = (entity: string, value: any) => {
    console.log('handleOnChange', entity, value);
    const newObject = {...filteringData};
    delete newObject[entity];
    onFilteringDataChange({ ...newObject, ...(value?.length > 0 ? { [entity]: value } : {})});
  };

  const [dealNumber, setDealNumber] = useState<string>(filteringData?.dealNumber);

  useEffect(() => {
    setDealNumber(filteringData?.dealNumber || '');
  }, [filteringData?.dealNumber]);

  /**Debouncing enter deal number */
  useEffect(() => {
    if (!open) return;
    
    const sendRequestNumber = setTimeout(() => {
      handleOnChange('dealNumber', dealNumber);
    }, 2000)

    return () => clearTimeout(sendRequestNumber);

  }, [dealNumber]);

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
          <Stack spacing={3}>
            <TextField
              label="Номер заявки"
              value={filteringData?.requestNumber || ''}
              onChange={(e) => handleOnChange('requestNumber', e.target.value)}
            />
            <Autocomplete
              options={customers}
              value={
                customers?.filter(customer => filteringData && (filteringData.customers)?.find((el: any) => el.ID === customer.ID))
              }
              onChange={(e, value) => handleOnChange('customers', value)}
              multiple
              limitTags={2}
              getOptionLabel={option => option.NAME}
              filterOptions={filterOptions(50, 'NAME')}
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
                  label="Клиент"
                  placeholder="Выберите клиентов"
                />
              )}
              loading={customerFetching}
              loadingText="Загрузка данных..."
            />
            <Autocomplete
              options={departments || []}
              value={
                departments?.filter(department => filteringData && (filteringData.departments)?.find((el: any) => el.ID === department.ID))
              }
              onChange={(e, value) => handleOnChange('departments', value)}
              multiple
              limitTags={2}
              getOptionLabel={option => option.NAME}
              filterOptions={filterOptions(50, 'NAME')}
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
                  label="Подразделение"
                  placeholder="Выберите Подразделение"
                />
              )}
              loading={departmentsFetching}
              loadingText="Загрузка данных..."
            />
            <TextField
              label="Номер сделки"
              value={dealNumber || ''}
              onChange={(e) => setDealNumber(e.target.value)}
            />
          </Stack>
        </CardContent>
        <CardActions style={{
          padding: '16px'
        }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onFilterClear();
              setDealNumber('');
              onClose && onClose({}, 'backdropClick');
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
