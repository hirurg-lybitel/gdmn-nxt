import { ICustomerContract } from '@gsbelarus/util-api-types';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { HTMLAttributes, useCallback } from 'react';
import { useAutocompleteVirtualization } from '../helpers/hooks/useAutocompleteVirtualization';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useGetCustomerContractsQuery } from '../../features/customer-contracts/customerContractsApi';

interface Props{
  value: ICustomerContract[] | ICustomerContract | null;
  onChange: (value: ICustomerContract[] | ICustomerContract | null) => void;
  label?: string;
  placeholder?: string;
  limitTags?: number;
  multiple?: boolean,
  disableCloseOnSelect?: boolean
}
export function ContactsSelect({
  value,
  onChange,
  label = 'Заказы',
  placeholder,
  limitTags = -1,
  multiple = false,
  disableCloseOnSelect = false
}: Props) {
  const { data: contracts, isFetching: contractsIsFetching } = useGetCustomerContractsQuery();

  const handleOnChange = useCallback((e: React.SyntheticEvent<Element, Event>, value: ICustomerContract[] | ICustomerContract | null) => onChange(value), [onChange]);

  const [ListboxComponent] = useAutocompleteVirtualization();

  const getContracts = useCallback(() => {
    if (multiple) {
      return contracts?.filter(contract => (value as ICustomerContract[])?.find((el) => el.ID === contract.ID)) ?? [];
    }
    if (!value || !contracts) return null;
    return contracts[contracts.findIndex(contract => (value as ICustomerContract).ID === contract.ID)];
  }, [multiple, contracts, value]);

  return (
    <Autocomplete
      options={contracts ?? []}
      disableCloseOnSelect={disableCloseOnSelect}
      value={getContracts()}
      ListboxComponent={ListboxComponent}
      onChange={handleOnChange}
      multiple={multiple}
      limitTags={limitTags}
      getOptionLabel={option => option.USR$NUMBER}
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
          {option.USR$NUMBER}
        </div>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder ?? (multiple ? 'Выберите заказы' : 'Выберите заказ')}
        />
      )}
      loading={contractsIsFetching}
      loadingText="Загрузка данных..."
    />
  );
}
