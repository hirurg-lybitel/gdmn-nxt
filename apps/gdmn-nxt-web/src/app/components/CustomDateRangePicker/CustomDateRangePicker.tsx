import { DialogProps } from '@mui/material';
import { DateRangePicker, DateRangePickerProps, PickersShortcutsItem } from '@mui/x-date-pickers-pro';
import { useCallback, useMemo } from 'react';
import { CustomDateRangePickerDialog, defaultShortcutsItems, DefaultShortcutsLabel } from '../button-date-range-picker';

export default function CustomDateRangePicker(props: Omit<DateRangePickerProps<Date>, 'open' | 'onOpen' | 'onClose'> & { options?: DefaultShortcutsLabel[] }) {
  const usedShortCuts = useMemo(() => (props.slotProps?.shortcuts as any)?.items ?? defaultShortcutsItems,
    [props.slotProps?.shortcuts]);

  const shortcuts = useMemo(() => props.options ?
    usedShortCuts.filter(({ label }: PickersShortcutsItem<Date>) => props.options?.includes(label as DefaultShortcutsLabel))
    : usedShortCuts, [props.options, usedShortCuts]);

  return (
    <DateRangePicker
      {...props}
      slots={{
        ...props.slots,
        dialog: useCallback((dialogProps: DialogProps) => {
          return (
            <CustomDateRangePickerDialog
              {...dialogProps}
              shortcuts={shortcuts}
              onChangeDate={props.onChange}
            />
          );
        }, [JSON.stringify(props.onChange), JSON.stringify(shortcuts)])
      }}
    />
  );
}
