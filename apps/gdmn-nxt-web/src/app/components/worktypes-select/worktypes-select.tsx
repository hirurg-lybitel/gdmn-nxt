import { IWorkType } from '@gsbelarus/util-api-types';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '@gdmn-nxt/helpers/hooks/useAutocompleteVirtualization';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useGetWorkTypesQuery } from '../../features/work-types/workTypesApi';

interface Props{
  value: IWorkType[] | IWorkType | null;
  onChange: (value: IWorkType[] | IWorkType | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean
}
export function WorktypesSelect({
  value,
  onChange,
  label = 'Виды работ',
  placeholder,
  limitTags = -1,
  multiple = false,
  disableCloseOnSelect = false
}: Props) {
  const { data: workTypes, isFetching: workTypesIsFetching } = useGetWorkTypesQuery();
  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IWorkType[] | IWorkType | null) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getWorktypes = useCallback(() => {
    if (multiple) {
      return workTypes?.filter(worktype => (value as IWorkType[])?.find((el) => el.ID === worktype.ID)) ?? [];
    }
    if (!value || !workTypes) return null;
    return workTypes[workTypes.findIndex(worktype => (value as IWorkType).ID === worktype.ID)];
  }, [multiple, workTypes, value]);

  return (
    <Autocomplete
      options={workTypes ?? []}
      disableCloseOnSelect={disableCloseOnSelect}
      value={getWorktypes()}
      ListboxComponent={ListboxComponent}
      onChange={handleOnChange}
      multiple={multiple}
      limitTags={limitTags}
      getOptionLabel={option => option.USR$NAME}
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
          {option.USR$NAME}
        </div>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder ?? (multiple ? 'Выберите виды работ' : 'Выберите вид работы')}
        />
      )}
      loading={workTypesIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
