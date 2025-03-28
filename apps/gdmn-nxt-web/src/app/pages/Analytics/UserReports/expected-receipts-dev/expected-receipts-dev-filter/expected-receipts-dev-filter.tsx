import { Autocomplete, Checkbox, FormControlLabel, TextField, Tooltip } from '@mui/material';
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
      <Autocomplete
        disabled={disabled}
        options={sortFields}
        size="small"
        sx={{ width: 310 }}
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
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={filterData?.includeZeroRest ?? false}
            onChange={(e) => handleChange(e, 'includeZeroRest')}
          />
        }
        label="Договоры с остатком 0"
      />
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={filterData?.includePlanned ?? false}
            onChange={(e) => handleChange(e, 'includePlanned')}
          />
        }
        label="Планируемые договоры"
      />
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={filterData?.endsInPeriod ?? false}
            onChange={(e) => handleChange(e, 'endsInPeriod')}
          />
        }
        label="Оканчиваются в периоде"
      />
      <Tooltip title={'Договоры с последней оплатной или актом > 2-х лет назад'}>
        <FormControlLabel
          disabled={disabled}
          control={
            <Checkbox
              checked={filterData?.inculdeFreezing ?? false}
              onChange={(e) => handleChange(e, 'inculdeFreezing')}
            />
          }
          label="Зависшие"
        />
      </Tooltip>
    </>
  );
}
