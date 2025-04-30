import { Autocomplete, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { IFieldsSort, sortFields } from '../constants';
import { ICustomer, IFilteringData } from '@gsbelarus/util-api-types';
import { useCallback, useMemo, useState } from 'react';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { useGetCustomersQuery } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';

interface IRevenueFilterProps {
  filterData: IFilteringData,
  saveFilters: (filteringData: IFilteringData) => void
  disabled: boolean
}

export function RevenueFilter({ filterData, saveFilters, disabled }: IRevenueFilterProps) {
  const handleChangeSort = useCallback((e: any, value: IFieldsSort) => {
    const data = { ...filterData };

    if (value?.value === undefined) {
      delete data['sortField'];
      delete data['sort'];
    } else {
      data['sortField'] = value.value;
      data['sort'] = value.sort;
    }

    saveFilters(data);
  }, [filterData, saveFilters]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const data = { ...filterData };
    data[name] = e.target.checked;
    saveFilters(data);
  }, [filterData, saveFilters]);

  const { data, isFetching: customerFetching } = useGetCustomersQuery();
  const customers: ICustomer[] = useMemo(() => [...(data?.data || [])], [data?.data]);

  const handleCustomerSelect = useCallback((value: any) => {
    const data = { ...filterData };
    if (value) {
      data.customer = value.ID;
    } else {
      delete data.customer;
    }
    saveFilters(data);
  }, [filterData, saveFilters]);

  return (
    <>
      <Autocomplete
        disabled={disabled}
        options={sortFields}
        size="small"
        sx={{ width: 350 }}
        disableClearable
        getOptionLabel={option => option.name}
        value={sortFields.find(item => {
          return item.value === filterData?.sortField &&
          item.sort === filterData?.sort;
        }) ?? sortFields[0]}
        onChange={handleChangeSort}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id}>
            {option.name}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label="Сортировка"
            placeholder="Сортировка"
          />
        )}
      />
      <div style={{ width: '250px' }}>
        <CustomerSelect
          disableEdition
          value={customers.find((customer) => customer.ID === filterData?.customer)}
          onChange={handleCustomerSelect}
        />
      </div>
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={filterData?.groupByOrganization ?? false}
            onChange={(e) => handleChange(e, 'groupByOrganization')}
          />
        }
        label="Группировать по организации"
      />
    </>
  );
}
