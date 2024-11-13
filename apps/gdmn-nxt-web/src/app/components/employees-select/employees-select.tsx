import { IContactWithID } from '@gsbelarus/util-api-types';
import { Autocomplete, Checkbox, FilterOptionsState, InputAdornment, TextField, TextFieldVariants } from '@mui/material';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '../helpers/hooks/useAutocompleteVirtualization';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useGetEmployeesQuery } from '../../features/contact/contactApi';

interface Props{
  value: IContactWithID[] | IContactWithID | null;
  onChange: (value: IContactWithID[] | IContactWithID | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean,
  filterOptions?: (options: IContactWithID, state: FilterOptionsState<IContactWithID>) => boolean,
  filter?: (emploee: IContactWithID) => boolean,
  disabled?: boolean,
  required?: boolean,
  style?: React.CSSProperties,
  textFieldVariant?: TextFieldVariants,
  error?: boolean,
  helperText?: React.ReactNode,
  readOnly?: boolean
}
export function EmployeesSelect({
  value,
  onChange,
  label = 'Сотрудник',
  placeholder,
  limitTags = -1,
  multiple = false,
  disableCloseOnSelect = false,
  filter,
  disabled,
  required,
  style,
  textFieldVariant,
  error,
  helperText,
  readOnly
}: Props) {
  const { data: employees = [], isFetching: employeesIsFetching } = useGetEmployeesQuery();
  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IContactWithID[] | IContactWithID | null) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getEmployees = useCallback(() => {
    if (multiple) {
      return employees?.filter(employee => (value as IContactWithID[])?.find((el) => el.ID === employee.ID)) ?? [];
    }
    if (!value || !employees) return null;
    return employees[employees.findIndex(employee => (value as IContactWithID).ID === employee.ID)];
  }, [multiple, employees, value]);

  return (
    <Autocomplete
      style={style}
      readOnly={readOnly}
      disabled={disabled}
      options={(filter ? employees.filter(employee => filter(employee)) : employees) ?? []}
      disableCloseOnSelect={disableCloseOnSelect}
      value={getEmployees()}
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
            paddingTop: 2,
            paddingBottom: 2
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
          error={error}
          helperText={helperText}
          variant={textFieldVariant}
          required={required}
          label={label}
          placeholder={placeholder ?? (multiple ? 'Выберите сотрудников' : 'Выберите сотрудника')}
        />
      )}
      loading={employeesIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
