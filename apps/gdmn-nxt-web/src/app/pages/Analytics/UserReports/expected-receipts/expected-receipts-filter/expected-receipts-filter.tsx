import { Autocomplete, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { IFieldsSort, sortFields } from '../constants';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { useCallback } from 'react';

interface IExpectedReceiptsFilterProps {
  filterData: IFilteringData,
  saveFilters: (filteringData: IFilteringData) => void
  disabled: boolean
}

export function ExpectedReceiptsFilter({ filterData, saveFilters, disabled }: IExpectedReceiptsFilterProps) {
  const handleIncludePerTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const data = { ...filterData };
    data['includePerTime'] = e.target.checked;
    saveFilters(data);
  }, [filterData, saveFilters]);

  const handleChangeProjectStatus = useCallback((e: any, value: IFieldsSort) => {
    const data = { ...filterData };

    console.log(value);

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
    <>
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={filterData?.includePerTime ?? false}
            onChange={handleIncludePerTimeChange}
          />
        }
        label="Учитывать поверменную оплату"
      />
      <Autocomplete
        disabled={disabled}
        options={sortFields}
        size="small"
        sx={{ width: 280 }}
        disableClearable
        getOptionLabel={option => option.name}
        value={sortFields.find(item => {
          return item.value === filterData?.sortField &&
          item.sort === filterData?.sort;
        }) ?? sortFields[0]}
        onChange={handleChangeProjectStatus}
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
    </>
  );
}
