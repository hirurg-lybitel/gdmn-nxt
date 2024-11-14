import { IBusinessProcess } from '@gsbelarus/util-api-types';
import { Autocomplete, Checkbox, createFilterOptions, TextField } from '@mui/material';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '../../helpers/hooks/useAutocompleteVirtualization';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useGetBusinessProcessesQuery } from '../../../features/business-processes';
import { maxVirtualizationList } from '@gdmn/constants/client';

interface Props{
  value: IBusinessProcess[] | IBusinessProcess | null;
  onChange: (value: IBusinessProcess[] | IBusinessProcess | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean,
  required?: boolean
}
export function BusinessProcessesSelect({
  value,
  onChange,
  label = 'Бизнес процессы',
  placeholder,
  limitTags = -1,
  multiple = false,
  disableCloseOnSelect = false,
  required
}: Props) {
  const { data: businessProcesses = [], isFetching: businessProcessesFetching } = useGetBusinessProcessesQuery();
  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: IBusinessProcess[] | IBusinessProcess | null) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getBusinessProcesses = useCallback(() => {
    if (multiple) {
      return businessProcesses?.filter(businessProcess => (value as IBusinessProcess[])?.find((el) => el.ID === businessProcess.ID)) ?? [];
    }
    if (!value || !businessProcesses) return null;
    return businessProcesses[businessProcesses.findIndex(businessProcess => (value as IBusinessProcess).ID === businessProcess.ID)];
  }, [multiple, businessProcesses, value]);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: maxVirtualizationList,
    ignoreCase: true,
    stringify: (option: IBusinessProcess) => `${option.NAME}`,
  });

  return (
    <Autocomplete
      filterOptions={filterOptions}
      options={businessProcesses ?? []}
      disableCloseOnSelect={disableCloseOnSelect}
      value={getBusinessProcesses()}
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
          required={required}
          placeholder={placeholder ?? (multiple ? 'Выберите бизнес процессы' : 'Выберите бизнес процесс')}
        />
      )}
      loading={businessProcessesFetching}
      loadingText="Загрузка данных..."
    />
  );
}
