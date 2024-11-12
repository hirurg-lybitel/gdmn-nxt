import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, InputAdornment, TextField, Tooltip } from '@mui/material';
import { useGetContactPersonsQuery } from '../../../features/contact/contactApi';
import { IContactPerson } from '@gsbelarus/util-api-types';
import filterOptions from '@gdmn-nxt/components/helpers/filter-options';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '@gdmn-nxt/components/helpers/hooks/useAutocompleteVirtualization';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

interface Props {
  value: IContactPerson[] | IContactPerson | null;
  onChange: (value: IContactPerson[] | IContactPerson | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  error?: boolean,
  helperText?: string
}
export function ContactSelect({
  value,
  onChange,
  label = 'Контакты',
  placeholder,
  limitTags = -1,
  multiple = false,
  error,
  helperText
}: Props) {
  const {
    data: persons,
    isFetching: personsIsFetching,
  } = useGetContactPersonsQuery();

  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IContactPerson[] | IContactPerson | null) => onChange(value), [onChange]);

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
                <InputAdornment position="end">
                  <ManageAccountsIcon />
                </InputAdornment>
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
