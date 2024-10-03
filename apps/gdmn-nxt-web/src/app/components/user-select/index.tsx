import { Autocomplete, AutocompleteProps, Checkbox, createFilterOptions, TextField, Typography } from '@mui/material';
import styles from './user-select.module.less';
import { useGetUsersQuery } from '../../features/systemUsers';
import { IUser } from '@gsbelarus/util-api-types';

const filterOptions = createFilterOptions<IUser>({
  matchFrom: 'any',
  limit: 20,
  stringify: (option) => `${option.NAME} ${option.CONTACT?.NAME}`
});

export interface UserSelectProps<
  Value,
> extends Omit<AutocompleteProps<
  Value, boolean | undefined, boolean | undefined, false>,
  'options' | 'renderInput' | 'renderOption'
> {
  label?: string;
  placeholder?: string;
}


export function UserSelect({
  multiple,
  label = multiple ? 'Пользователи' : 'Пользователь',
  placeholder = 'Выберите пользователя',
  ...props
}: UserSelectProps<IUser>) {
  const {
    data: users = [],
    isFetching
  } = useGetUsersQuery();


  return (
    <Autocomplete
      multiple={multiple}
      loading={isFetching}
      loadingText="Загрузка данных..."
      options={users}
      getOptionLabel={option => option.CONTACT?.NAME ?? option.NAME}
      filterOptions={filterOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
        />
      )}
      renderOption={(props, option, { selected }) => (
        <li {...props} key={option.ID}>
          {multiple &&
            <Checkbox
              style={{ marginRight: 8 }}
              checked={selected}
            />}
          <div>
            {option.CONTACT?.NAME}
            <div>
              <Typography variant="caption">{option.NAME}</Typography>
            </div>
          </div>
        </li>
      )}
      {...props}
    />
  );
}

export default UserSelect;
