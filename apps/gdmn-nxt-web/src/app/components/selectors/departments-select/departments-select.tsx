import { IContactWithID } from '@gsbelarus/util-api-types';
import { Autocomplete, Checkbox, createFilterOptions, InputAdornment, TextField } from '@mui/material';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import { useGetDepartmentsQuery } from '../../../features/departments/departmentsApi';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { maxVirtualizationList } from '@gdmn/constants/client';

interface Props{
  value: IContactWithID[] | IContactWithID | null;
  onChange: (value: IContactWithID[] | IContactWithID | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean,
  required?: boolean,
  error?: boolean,
  helperText?: React.ReactNode
}
export function DepartmentsSelect({
  value,
  onChange,
  label = 'Отдел',
  placeholder,
  limitTags = -1,
  multiple = false,
  disableCloseOnSelect = false,
  required,
  error,
  helperText
}: Props) {
  const { data: departments, isFetching: departmentsIsFetching } = useGetDepartmentsQuery();

  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IContactWithID[] | IContactWithID | null) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getDepartments = useCallback(() => {
    if (multiple) {
      return departments?.filter(department => (value as IContactWithID[])?.find((el) => el.ID === department.ID)) ?? [];
    }
    if (!value || !departments) return null;
    return departments[departments.findIndex(department => (value as IContactWithID).ID === department.ID)];
  }, [multiple, departments, value]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: IContactWithID) => `${option.NAME}`,
  });

  return (
    <Autocomplete
      filterOptions={filterOptions}
      options={departments ?? []}
      disableCloseOnSelect={disableCloseOnSelect}
      value={getDepartments()}
      ListboxComponent={ListboxComponent}
      onChange={handleOnChange}
      multiple={multiple}
      limitTags={limitTags}
      getOptionLabel={option => option.NAME}
      renderOption={(props, option, { selected }) => (
        <div
          {...props as HTMLAttributes<HTMLElement>}
          key={option.ID}
          style={{
            paddingTop: 6,
            paddingBottom: 6
          }}
        >
          {multiple && (
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
          )}
          {option.NAME}
        </div>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          placeholder={placeholder ?? (multiple ? 'Выберите отделы' : 'Выберите отдел')}
          error={error}
          helperText={helperText}
        />
      )}
      loading={departmentsIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
