import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, AutocompleteProps, Checkbox, InputAdornment, TextField } from '@mui/material';
import { useGetContactPersonsQuery } from '../../../features/contact/contactApi';
import { IContactPerson } from '@gsbelarus/util-api-types';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '@gdmn-nxt/components/helpers/hooks/useAutocompleteVirtualization';

type ValueType = IContactPerson[] | IContactPerson | null;
interface ContactSelectProps<Value> extends Omit<AutocompleteProps<
  Value, boolean | undefined, boolean | undefined, false>,
  'value' | 'options' | 'renderInput' | 'renderOption' | 'onChange'
> {
  value: ValueType;
  onChange: (value: ValueType) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  error?: boolean,
  helperText?: React.ReactNode,
  slots?: {
    startIcon?: JSX.Element
  }
}
export function ContactSelect({
  value,
  onChange,
  label = 'Контакты',
  placeholder,
  limitTags = -1,
  multiple = false,
  error,
  helperText,
  slots
}: Readonly<ContactSelectProps<IContactPerson>>) {
  const {
    data: persons,
    isFetching: personsIsFetching,
  } = useGetContactPersonsQuery();

  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: ValueType) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getPersons = useCallback(() => {
    if (multiple) {
      return persons?.records?.filter(employee => (value as IContactPerson[])?.find((el) => el.ID === employee.ID)) ?? [];
    }
    if (!value || !persons?.records) return null;
    return persons.records[persons.records.findIndex(employee => (value as IContactPerson).ID === employee.ID)];
  }, [multiple, persons?.records, value]);

  return (
    <Autocomplete
      options={persons?.records ?? []}
      value={getPersons()}
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
          label={label}
          error={error}
          helperText={helperText}
          placeholder={placeholder ?? (multiple ? 'Выберите контакты' : 'Выберите контакт')}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {slots?.startIcon &&
                <InputAdornment position="end">
                  {slots?.startIcon}
                </InputAdornment>}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      loading={personsIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
