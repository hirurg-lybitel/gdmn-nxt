import { Autocomplete, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { IFieldsSort, sortFields } from '../constants';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { useCallback } from 'react';

interface IExpensesFilterProps {
  filterData: IFilteringData,
  saveFilters: (filteringData: IFilteringData) => void
  disabled: boolean
}

export function ExpensesFilter({ filterData, saveFilters, disabled }: IExpensesFilterProps) {
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

  return (
    <Autocomplete
      disabled={disabled}
      options={sortFields}
      size="small"
      sx={{ width: 260 }}
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
  );
}
