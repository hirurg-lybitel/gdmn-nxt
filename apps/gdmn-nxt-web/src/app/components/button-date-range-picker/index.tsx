import { DateRange, DateRangePicker, DateRangePickerProps, DateRangeValidationError, PickerChangeHandlerContext, PickersShortcutsItem, SingleInputDateRangeFieldProps } from '@mui/x-date-pickers-pro';
import { forwardRef, Ref, RefAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from '@gdmn-nxt/dayjs';
import { Box, Button, Dialog, Popper, useForkRef, useMediaQuery, useTheme } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

interface DateRangeButtonFieldProps extends SingleInputDateRangeFieldProps<Date> {
  onClick: () => void;
}

const shortcutsLabels = [
  'Эта неделя',
  'Прошлая неделя',
  'Последние 7 дней',
  'Текущий месяц',
  'Прошлый месяц',
  'Следующий месяц',
  'Текущий год',
  'Прошлый год',
  'Сбросить'
] as const;
type ShortcutsLabel = typeof shortcutsLabels[number]

const shortcutsItems: PickersShortcutsItem<DateRange<Date>>[] = [
  {
    label: shortcutsLabels[0],
    getValue: () => {
      const today = dayjs();
      return [today.startOf('week').toDate(), today.endOf('week').toDate()];
    },
  },
  {
    label: shortcutsLabels[1],
    getValue: () => {
      const today = dayjs();
      const prevWeek = today.subtract(7, 'day');
      return [prevWeek.startOf('week').toDate(), prevWeek.endOf('week').toDate()];
    },
  },
  {
    label: shortcutsLabels[2],
    getValue: () => {
      const today = dayjs();
      return [today.subtract(7, 'day').toDate(), today.toDate()];
    },
  },
  {
    label: shortcutsLabels[3],
    getValue: () => {
      const today = dayjs();
      return [today.startOf('month').toDate(), today.endOf('month').toDate()];
    },
  },
  {
    label: shortcutsLabels[4],
    getValue: () => {
      const today = dayjs();
      return [today.add(-1, 'M').startOf('month')
        .toDate(), today.add(-1, 'M').endOf('month')
        .toDate()];
    },
  },
  // {
  //   label: shortcutsLabels[5],
  //   getValue: () => {
  //     const today = dayjs();
  //     const startOfNextMonth = today.endOf('month').add(1, 'day');
  //     return [startOfNextMonth.toDate(), startOfNextMonth.endOf('month').toDate()];
  //   },
  // },
  {
    label: shortcutsLabels[6],
    getValue: () => {
      const today = dayjs();
      return [today.startOf('year').toDate(), today.endOf('year').toDate()];
    }
  },
  {
    label: shortcutsLabels[7],
    getValue: () => {
      const today = dayjs();
      return [today.add(-1, 'year').startOf('year')
        .toDate(), today.add(-1, 'year').endOf('year')
        .toDate()];
    }
  },
  { label: shortcutsLabels[shortcutsLabels.length - 1], getValue: () => [null, null] },
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
      sx
    } = props;

    const handleRef = useForkRef(ref, containerRef);

    const theme = useTheme();
    const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

    const elRef = useRef<any>(null);

    return (
      <div ref={elRef} style={{ width: '100%' }}>
        <Button
          variant="outlined"
          id={id}
          disabled={disabled}
          ref={handleRef}
          aria-label={ariaLabel}
          onClick={onClick}
          startIcon={<CalendarMonthIcon />}
          sx={{
            width: 'fit-content',
            textTransform: 'none',
            '& span': { marginRight: label === false ? 0 : '8px' },
            minWidth: 0,
            ...sx
          }}
        >
          <span style={{ width: '100%' }}>
            {label ?? (
              Array.isArray(value) && value?.length > 0 && value[0] !== null
                ? `${matchDownSm ? '' : 'Текущий диапазон дат:'} ${value.map(date => date ? dayjs(date).format('DD.MM.YYYY') : 'null').join(' - ')}`
                : 'Выберите диапазон дат')}
          </span>
        </Button>
      </div>
    );
  }
) as DateRangeButtonFieldComponent;

DateRangeButtonField.displayName = 'DateRangeButtonField';
DateRangeButtonField.fieldType = 'single-input';

const ButtonDateRangePicker = forwardRef(
  (
    props: Omit<DateRangePickerProps<Date>, 'open' | 'onOpen' | 'onClose'> & { options?: ShortcutsLabel[] },
    ref: Ref<HTMLDivElement>
  ) => {
    const { onChange } = props;

    const [open, setOpen] = useState(false);
    const buttonOnClick = useCallback(() => setOpen(prev => !prev), []);
    const onClose = useCallback(() => setOpen(false), []);
    const onOpen = useCallback(() => setOpen(true), []);

    const shortcuts = useMemo(() => props.options ?
      shortcutsItems.filter(({ label }) => props.options?.includes(label as ShortcutsLabel))
      : shortcutsItems, [props.options]);

    const theme = useTheme();
    const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

    return (
      <DateRangePicker
        slots={{
          field: DateRangeButtonField,
          ...props.slots,
          dialog: useCallback((dialogProps: any) => {
            return (
              <Dialog {...dialogProps}>
                <Box
                  sx={{
                    '& .MuiPickersLayout-shortcuts': {
                      display: 'none'
                    },
                    '& .MuiDialogContent-root': {
                      padding: matchDownSm ? 0 : undefined
                    },
                    '& .MuiPickersLayout-root': {
                      display: 'flex',
                      flexDirection: 'column'
                    }
                  }}
                >
                  <div style={{ padding: '20px 24px 0 20px', display: 'flex', flexWrap: 'wrap', gap: '10px', maxWidth: '400px' }}>
                    {shortcuts.map((shortcut, index) => {
                      const handleShortCutClick = () => {
                        onChange && onChange(
                          shortcut.getValue({ isValid: () => true }),
                          { shortcut: { label: shortcut.label }, validationError: [null, null] }
                        );
                        dialogProps.onClose();
                      };
                      return (
                        <Button
                          key={index}
                          variant="contained"
                          onClick={handleShortCutClick}
                          style={{
                            background: 'rgba(255, 255, 255, 0.16)',
                            textTransform: 'none',
                            borderRadius: '16px',
                            fontWeight: '400',
                            color: theme.palette.mode === 'dark' ? theme.textColor : theme.palette.text.primary
                          }}
                        >
                          {shortcut.label}
                        </Button>
                      );
                    })}
                  </div>
                  {dialogProps.children}
                </Box>
              </Dialog>
            );
            // обернуто в JSON.stringify потому что обновляется при изменении даты и диалог мигает
          }, [matchDownSm, JSON.stringify(onChange), JSON.stringify(shortcuts), theme.palette.mode, theme.palette.text.primary, theme.textColor])
        }}
        slotProps={{
          field: { onClick: buttonOnClick } as any,
          shortcuts: {
            items: shortcuts,
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
