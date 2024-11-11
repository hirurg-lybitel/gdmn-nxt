import { IClientHistoryType } from '@gsbelarus/util-api-types';
import { Autocomplete, Checkbox, TextField, TextFieldVariants } from '@mui/material';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '../helpers/hooks/useAutocompleteVirtualization';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useGetClientHistoryTypeQuery } from '../../features/kanban/kanbanCatalogsApi';

interface Props{
  value?: IClientHistoryType[] | IClientHistoryType | null;
  onChange: (value: IClientHistoryType[] | IClientHistoryType | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean,
  required?: boolean,
  style?: React.CSSProperties,
  textfieldVariant?: TextFieldVariants,
  textFieldRef?: React.MutableRefObject<HTMLTextAreaElement | null>
}
export function HistoryType({
  value,
  onChange,
  label = 'Тип',
  placeholder,
  limitTags = -1,
  multiple = false,
  disableCloseOnSelect = false,
  required,
  style,
  textfieldVariant,
  textFieldRef
}: Props) {
  const { data: historyType = [], isFetching: historyTypeIsFetching } = useGetClientHistoryTypeQuery();
  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IClientHistoryType[] | IClientHistoryType | null) => onChange(value), [onChange]);

  const gethistoryTypes = useCallback(() => {
    if (multiple) {
      return historyType?.filter(historyType => (value as IClientHistoryType[])?.find((el) => el.ID === historyType.ID)) ?? [];
    }
    if (!value || !historyType) return null;
    return historyType[historyType.findIndex(historyType => (value as IClientHistoryType).ID === historyType.ID)];
  }, [multiple, historyType, value]);

  return (
    <Autocomplete
      style={style}
      options={historyType ?? []}
      disableCloseOnSelect={disableCloseOnSelect}
      value={value === undefined ? undefined : gethistoryTypes()}
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
          inputRef={textFieldRef}
          variant={textfieldVariant}
          {...params}
          label={label}
          required={required}
          placeholder={placeholder ?? (multiple ? 'Выберите тип' : 'Выберите тип')}
        />
      )}
      loading={historyTypeIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
