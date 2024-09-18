import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { useGetContactPersonsQuery } from '../../../features/contact/contactApi';
import { IContactPerson } from '@gsbelarus/util-api-types';
import filterOptions from '@gdmn-nxt/components/helpers/filter-options';
import { useCallback } from 'react';


interface Props {
  value: IContactPerson[];
  onChange: (value: IContactPerson[]) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
}
export function ContactSelect({
  value,
  onChange,
  label = 'Контакты',
  placeholder = 'Выберите контакты',
  limitTags = -1
}: Props) {
  const {
    data: persons,
    isFetching: personsIsFetching,
  } = useGetContactPersonsQuery();

  const handleOnChange = useCallback((e: any, value: IContactPerson[]) => onChange(value), [onChange]);

  return (
    <Autocomplete
      options={persons?.records ?? []}
      value={
        persons?.records?.filter(employee => value?.find((el) => el.ID === employee.ID)) ?? []
      }
      onChange={handleOnChange}
      multiple
      limitTags={limitTags}
      getOptionLabel={option => option.NAME}
      filterOptions={filterOptions(50, 'NAME')}
      renderOption={(props, option, { selected }) => (
        <li
          {...props}
          key={option.ID}
          style={{
            paddingTop: 2,
            paddingBottom: 2
          }}
        >
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.NAME}
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
