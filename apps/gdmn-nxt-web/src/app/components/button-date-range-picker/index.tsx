import { DateRange, DateRangePicker, DateRangePickerProps, PickersShortcutsItem, SingleInputDateRangeFieldProps } from '@mui/x-date-pickers-pro';
import { forwardRef, Ref, RefAttributes, useCallback, useState } from 'react';
import dayjs from '@gdmn-nxt/dayjs';
import { Button, useForkRef } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface DateRangeButtonFieldProps extends SingleInputDateRangeFieldProps<Date> {
  onClick: () => void;
}

const shortcutsItems: PickersShortcutsItem<DateRange<Date>>[] = [
  {
    label: 'Эта неделя',
    getValue: () => {
      const today = dayjs();
      return [today.startOf('week').toDate(), today.endOf('week').toDate()];
    },
  },
  {
    label: 'Прошлая неделя',
    getValue: () => {
      const today = dayjs();
      const prevWeek = today.subtract(7, 'day');
      return [prevWeek.startOf('week').toDate(), prevWeek.endOf('week').toDate()];
    },
  },
  {
    label: 'Последние 7 дней',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(7, 'day').toDate(), today.toDate()];
    },
  },
  {
    label: 'Текущий месяц',
    getValue: () => {
      const today = dayjs();
      return [today.startOf('month').toDate(), today.endOf('month').toDate()];
    },
  },
  {
    label: 'Прошлый месяц',
    getValue: () => {
      const today = dayjs();
      return [today.add(-1, 'M').startOf('month').toDate(), today.add(-1, 'M').endOf('month').toDate()];
    },
  },
  {
    label: 'Следующий месяц',
    getValue: () => {
      const today = dayjs();
      const startOfNextMonth = today.endOf('month').add(1, 'day');
      return [startOfNextMonth.toDate(), startOfNextMonth.endOf('month').toDate()];
    },
  },
  { label: 'Сбросить', getValue: () => [null, null] },
];

type DateRangeButtonFieldComponent = ((
  props: DateRangeButtonFieldProps & RefAttributes<HTMLDivElement>
) => JSX.Element) & { fieldType?: any, displayName: string }

const DateRangeButtonField = forwardRef(
  (props: DateRangeButtonFieldProps, ref: Ref<HTMLElement>) => {
    const {
      onClick,
      label,
      id,
      disabled,
      value,
      InputProps: { ref: containerRef } = {},
      inputProps: { 'aria-label': ariaLabel } = {},
    } = props;

    const handleRef = useForkRef(ref, containerRef);

    return (
      <Button
        variant="outlined"
        id={id}
        disabled={disabled}
        ref={handleRef}
        aria-label={ariaLabel}
        onClick={onClick}
        style={{
          width: 'fit-content',
          textTransform: 'none'
        }}
        startIcon={<CalendarMonthIcon />}
      >
        {label
          ? label
          : Array.isArray(value) && value?.length > 0 && value[0] !== null
            ? `Текущий диапазон дат: ${value.map(date => date ? dayjs(date).format('DD.MM.YYYY') : 'null').join(' - ')}`
            : 'Выберите диапазон дат'}
      </Button>
    );
  }
) as DateRangeButtonFieldComponent;

DateRangeButtonField.displayName = 'DateRangeButtonField';
DateRangeButtonField.fieldType = 'single-input';

const ButtonDateRangePicker = forwardRef(
  (
    props: Omit<DateRangePickerProps<Date>, 'open' | 'onOpen' | 'onClose'>,
    ref: Ref<HTMLDivElement>
  ) => {
    const [open, setOpen] = useState(false);
    const buttonOnClick = useCallback(() => setOpen(prev => !prev), []);
    const onClose = useCallback(() => setOpen(false), []);
    const onOpen = useCallback(() => setOpen(true), []);

    return (
      <DateRangePicker
        slots={{
          field: DateRangeButtonField,
          ...props.slots
        }}
        slotProps={{
          field: { onClick: buttonOnClick } as any,
          shortcuts: {
            items: shortcutsItems,
          },
        }}
        ref={ref}
        calendars={1}
        {...props}
        open={open}
        onClose={onClose}
        onOpen={onOpen}
      />
    );
  }
);

ButtonDateRangePicker.displayName = 'ButtonDateRangePicker';

export default ButtonDateRangePicker;