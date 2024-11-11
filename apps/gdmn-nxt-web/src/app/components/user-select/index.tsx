import { Autocomplete, AutocompleteProps, Checkbox, Chip, createFilterOptions, FormControlLabel, TextField, Typography } from '@mui/material';
import styles from './user-select.module.less';
import { useGetUsersQuery } from '../../features/systemUsers';
import { IUser } from '@gsbelarus/util-api-types';
import { ChangeEvent, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import CustomPaperComponent from '../helpers/custom-paper-component/custom-paper-component';
import { array } from 'yup/lib/locale';

const filterOptions = createFilterOptions<IUser>({
  matchFrom: 'any',
  limit: 20,
  stringify: (option) => `${option.NAME} ${option.CONTACT?.NAME}`
});

export interface UserSelectProps<
  Value,
> extends Omit<AutocompleteProps<
  Value, boolean | undefined, boolean | undefined, false>,
  'options' | 'renderInput' | 'renderOption' | 'onChange'
> {
  onChange?: (e: SyntheticEvent, value: IUser | IUser[] | null, allSelected?: boolean) => void;
  label?: string;
  placeholder?: string;
  disableSelectAll?: boolean;
  allSelected?: boolean;
  selectAllButton?: boolean;
  filter?: (user: IUser) => boolean
}

const selectAllObject = {
  type: 'selectAll'
};

export function UserSelect({
  multiple,
  label = multiple ? 'Пользователи' : 'Пользователь',
  placeholder = 'Выберите пользователя',
  disableSelectAll = false,
  allSelected = false,
  onChange,
  selectAllButton,
  filter,
  ...props
}: UserSelectProps<IUser>) {
  const {
    data: users = [],
    isFetching,
  } = useGetUsersQuery();

  const selectAllClick = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean) => {
    onChange && onChange(event, null, checked);
  };

  const memoPaperHeader = useMemo(() =>
    <div style={{ padding: '6px 16px' }}>
      {disableSelectAll
        ? <></>
        : <FormControlLabel
          style={{
            marginLeft: 0,
          }}
          control={
            <Checkbox
              checked={allSelected}
              onChange={selectAllClick}
              style={{
                marginRight: 8
              }}
            />
          }
          label="Выбрать всех"
        />
      }
    </div>,
  [allSelected, disableSelectAll, selectAllClick]);

  const handleChange = useCallback((event: SyntheticEvent, value: IUser | IUser[] | null) => {
    if (Array.isArray(value)) {
      onChange && onChange(event, value.filter(v => {
        if ('type' in v) {
          return v.type !== selectAllObject.type;
        }
        return true;
      }), false);
      return;
    }
    onChange && onChange(event, value, false);
  }, [onChange]);


  return (
    <Autocomplete
      multiple={multiple}
      loading={isFetching}
      loadingText="Загрузка данных..."
      options={filter ? users.filter(user => filter(user)) : users}
      onChange={handleChange}
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
      renderTags={(
        values,
        getTagProps,
        { getOptionLabel }
      ) => allSelected
        ? <Chip
          {...getTagProps({ index: 0 })}
          size="small"
          label="Все"
        />
        : values.map((user, index) => (
          <Chip
            {...getTagProps({ index })}
            key={index}
            size="small"
            label={getOptionLabel(user)}
          />
        ))}
      PaperComponent={CustomPaperComponent({ header: selectAllButton ? memoPaperHeader : undefined })}
      {...props}
      {...(allSelected ? {
        value: (multiple ? [selectAllObject] : selectAllObject) as unknown as IUser
      } : {
        value: props.value
      })}
    />
  );
}

export default UserSelect;
