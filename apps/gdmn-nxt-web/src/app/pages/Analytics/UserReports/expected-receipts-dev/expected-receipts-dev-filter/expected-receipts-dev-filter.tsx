import { Autocomplete, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { IFieldsSort, sortFields } from '../constants';
import { IFilteringData } from '@gsbelarus/util-api-types';
import { useCallback } from 'react';

interface IExpectedReceiptsFilterProps {
  filterData: IFilteringData,
  saveFilters: (filteringData: IFilteringData) => void
  disabled: boolean
}

export function ExpectedReceiptsDevFilter({ filterData, saveFilters, disabled }: IExpectedReceiptsFilterProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const data = { ...filterData };
    data[name] = e.target.checked;
    saveFilters(data);
  }, [filterData, saveFilters]);

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
    <>
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={filterData?.includeZeroRest ?? false}
            onChange={(e) => handleChange(e, 'includeZeroRest')}
          />
        }
        label="Включить договоры с остатком 0"
      />
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={filterData?.includePlanned ?? false}
            onChange={(e) => handleChange(e, 'includePlanned')}
          />
        }
        label="Включить планируемые договоры"
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
    </>
  );
}
