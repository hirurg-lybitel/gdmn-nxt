import { Autocomplete, Checkbox, createFilterOptions, FilterOptionsState, TextField, TextFieldVariants } from '@mui/material';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { maxVirtualizationList } from '@gdmn/constants/client';
import { IUserGroup } from '@gsbelarus/util-api-types';
import { useGetUserGroupsQuery } from '../../../features/permissions';

interface Props {
  value: IUserGroup[] | IUserGroup | null;
  onChange: (value: IUserGroup[] | IUserGroup | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean,
  filterOptions?: (options: IUserGroup, state: FilterOptionsState<IUserGroup>) => boolean,
  filter?: (userGroup: IUserGroup) => boolean,
  disabled?: boolean,
  required?: boolean,
  style?: React.CSSProperties,
  textFieldVariant?: TextFieldVariants,
  error?: boolean,
  helperText?: React.ReactNode,
  readOnly?: boolean;
}
export function UserGroupSelect({
  value,
  onChange,
  label = 'Группа пользователей',
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
}: Readonly<Props>) {
  const { data: userGroups = [], isFetching: userGroupsIsFetching } = useGetUserGroupsQuery();
  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IUserGroup[] | IUserGroup | null) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getUserGroups = useCallback(() => {
    if (multiple) {
      return userGroups?.filter(userGroup => (value as IUserGroup[])?.find((el) => el.ID === userGroup.ID)) ?? [];
    }
    if (!value || !userGroups) return null;
    return userGroups[userGroups.findIndex(userGroup => (value as IUserGroup).ID === userGroup.ID)] || null;
  }, [multiple, userGroups, value]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: IUserGroup) => `${option.NAME}`,
  });

  return (
    <Autocomplete
      filterOptions={filterOptions}
      style={style}
      readOnly={readOnly}
      disabled={disabled}
      options={(filter ? userGroups.filter(userGroup => filter(userGroup)) : userGroups) ?? []}
      disableCloseOnSelect={disableCloseOnSelect}
      value={getUserGroups()}
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
          error={error}
          helperText={helperText}
          variant={textFieldVariant}
          required={required}
          label={label}
          placeholder={placeholder ?? (multiple ? 'Выберите группу' : 'Выберите группу')}
        />
      )}
      loading={userGroupsIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
