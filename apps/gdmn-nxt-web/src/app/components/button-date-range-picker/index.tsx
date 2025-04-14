import { DateRange, DateRangePicker, DateRangePickerProps, DateRangeValidationError, PickerChangeHandlerContext, PickersShortcutsItem, SingleInputDateRangeFieldProps } from '@mui/x-date-pickers-pro';
import { forwardRef, Ref, RefAttributes, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from '@gdmn-nxt/dayjs';
import { Box, Button, Dialog, Popper, useForkRef, useMediaQuery } from '@mui/material';
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
      inputProps: { 'aria-label': ariaLabel } = {}
    } = props;

    const handleRef = useForkRef(ref, containerRef);

    const [shortLabel, setShortLabel] = useState(false);

    useEffect(() => {
      const onResize = () => {
        if (shortLabel === false && elRef.current.offsetWidth <= 385) {
          setShortLabel(true);
        }
        if (shortLabel === true && elRef.current.offsetWidth > 385) {
          setShortLabel(false);
        }
      };
      window.addEventListener('resize', onResize);
      onResize();
      return () => window.removeEventListener('resize', onResize);
    }, [shortLabel]);

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
          style={{
            width: 'fit-content',
            textTransform: 'none'
          }}
          startIcon={<CalendarMonthIcon />}
          sx={{
            '& span': { marginRight: label === false ? 0 : '8px' },
            minWidth: 0
          }}
        >
          {label !== undefined
            ? label
            : Array.isArray(value) && value?.length > 0 && value[0] !== null
              ? `${shortLabel ? '' : 'Текущий диапазон дат:'} ${value.map(date => date ? dayjs(date).format('DD.MM.YYYY') : 'null').join(' - ')}`
              : 'Выберите диапазон дат'}
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
      : shortcutsItems, [JSON.stringify(props.options)]);

    const matchDown450 = useMediaQuery('(max-width:450px)');
    const heightDown750 = useMediaQuery('(max-height:750px)');

    const smallPadding = matchDown450 || heightDown750;

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
                      padding: smallPadding ? '0' : undefined
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
                            fontWeight: '400'
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
          }, [JSON.stringify(onChange), shortcuts, smallPadding])
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
