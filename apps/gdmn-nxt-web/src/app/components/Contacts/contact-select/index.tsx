import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, TextField, Tooltip } from '@mui/material';
import { useGetContactPersonsQuery } from '../../../features/contact/contactApi';
import { IContactPerson } from '@gsbelarus/util-api-types';
import filterOptions from '@gdmn-nxt/components/helpers/filter-options';
import { useCallback } from 'react';
import { useAutocompleteVirtualization } from '@gdmn-nxt/components/helpers/hooks/useAutocompleteVirtualization';

interface Props {
  value: IContactPerson[] | IContactPerson | null;
  onChange: (value: IContactPerson[] | IContactPerson | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean
}
export function ContactSelect({
  value,
  onChange,
  label = 'Контакты',
  placeholder = 'Выберите контакты',
  limitTags = -1,
  multiple = false
}: Props) {
  const {
    data: persons,
    isFetching: personsIsFetching,
  } = useGetContactPersonsQuery();

  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IContactPerson[] | IContactPerson | null) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization({ itemHeight: 42 });

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
        <li
          {...props}
          key={option.ID}
          style={{
            paddingTop: 2,
            paddingBottom: 2,
            minHeight: '42px'
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
          <Tooltip title={option.NAME}>
            <div style={{ textWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {option.NAME}
            </div>
          </Tooltip>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
        />
      )}
      loading={personsIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
