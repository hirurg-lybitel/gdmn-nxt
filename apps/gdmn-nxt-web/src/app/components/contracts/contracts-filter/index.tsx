import { ICustomer, IFilteringData } from '@gsbelarus/util-api-types';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import CustomizedDialog from '@gdmn-nxt/components/Styled/customized-dialog/customized-dialog';
import { Button, CardActions, CardContent, Checkbox, FormControlLabel, Stack, TextField } from '@mui/material';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import { DateRange } from '@mui/lab';
import dayjs from '@gdmn-nxt/dayjs';
import FilterDialog from '@gdmn-nxt/components/filter-dialog/filter-dialog';

export interface ContractsFilterProps {
  open: boolean;
  filteringData: IFilteringData;
  onClose: () => void;
  onFilteringDataChange: (arg: IFilteringData) => void;
  onClear: () => void
}

export function ContractsFilter({
  open,
  filteringData,
  onClose,
  onFilteringDataChange,
  onClear
}: ContractsFilterProps) {
  const [period, setPeriod] = useState<DateRange<Date>>([filteringData?.dateBegin ?? null, filteringData?.dateEnd ?? null]);

  const handleOnChange = (entity: string, value: any) => {
    const newObject = { ...filteringData };
    delete newObject[entity];

    const newValue = (() => {
      if (typeof value === 'boolean' && !value) {
        return {};
      }
      if (value?.toString().length > 0) {
        return { [entity]: value };
      }
      return {};
    })();

    onFilteringDataChange({ ...newObject, ...newValue });
  };

  const filterClear = useCallback(() => {
    onClear();
    setPeriod([null, null]);
  }, [onClear]);


  const dateRangePickerChange = async (newValue: DateRange<Date>) => {
    if (!dayjs(newValue[0])?.isValid() || !dayjs(newValue[1])?.isValid()) return;
    handleOnChange('dateRange', [newValue[0]?.toISOString(), newValue[1]?.toISOString()]);
    setPeriod(newValue);
  };

  return (
    <FilterDialog
      open={open}
      onClear={filterClear}
      onClose={onClose}
    >
      <Stack spacing={2}>
        <CustomerSelect
          label="Клиенты"
          placeholder="Выберите клиента"
          multiple
          value={filteringData?.customers as ICustomer[] ?? []}
          onChange={(value) => handleOnChange('customers', value)}
        />
        <DateRangePicker
          value={period}
          onChange={dateRangePickerChange}
          slotProps={{ textField: { variant: 'outlined' } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filteringData?.isActive ?? false}
              onChange={(e) => handleOnChange('isActive', e.target.checked)}
            />
          }
          label="Только действуюшие"
        />
      </Stack>
    </FilterDialog>
  );
};
