import { Box, ClickAwayListener, Grid, Popper, TextField, ToggleButton, ToggleButtonGroup, useForkRef, useTheme } from '@mui/material';
import ChartColumn from '../../../components/Charts/chart-column/chart-column';
import ChartDonut from '../../../components/Charts/chart-donut/chart-donut';
import EarningCard from '../../../components/Charts/earning-card/earning-card';
import OrderCard from '../../../components/Charts/order-card/order-card';
import './dashboard.module.less';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { DealsSummarize } from './deals-summarize';
import { TasksSummarize } from './tasks-summarize';
import { forwardRef, KeyboardEvent, Ref, RefAttributes, useRef, useState } from 'react';
import { DateRange, DateRangeCalendar, DateRangePicker, SingleInputDateRangeFieldProps } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from '@gdmn-nxt/dayjs';
import { ColorMode } from '@gsbelarus/util-api-types';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import styles from './dashboard.module.less';
import ButtonDateRangePicker from '@gdmn-nxt/components/button-date-range-picker';

const dateFormat = 'DD.MM.YYYY';

/* eslint-disable-next-line */
export interface DashboardProps {}

interface DateRangeButtonFieldProps extends SingleInputDateRangeFieldProps<Date> {
  onClick: () => void;
}

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

    return (
      <TextField
        variant="standard"
        ref={handleRef}
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        style={{ height: '26px', width: '180px' }}
        value={label ?? (
          Array.isArray(value) && value?.length > 0 && value[0] !== null
            ? `${value.map(date => date ? dayjs(date).format('DD.MM.YYYY') : 'null').join(' - ')}`
            : 'Выберите диапазон дат')}
        onClick={onClick}
        sx={{
          ...sx
        }}
      />
    );
  }) as DateRangeButtonFieldComponent;

DateRangeButtonField.displayName = 'DateRangeButtonField';
DateRangeButtonField.fieldType = 'single-input';

export function Dashboard(props: DashboardProps) {
  const theme = useTheme();

  const [periodType, setPeriodType] = useState('1');
  const [openDateRange, setOpenDateRange] = useState(true);
  const [period, setPeriod] = useState<DateRange<Dayjs>>([dayjs().add(-1, 'week'), dayjs()]);

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    if (!newAlignment) return;
    setPeriodType(newAlignment);
    if (newAlignment === '5') {
      setOpenDateRange(true);
    };

    const newPeriod: DateRange<Dayjs> = (() => {
      switch (newAlignment) {
        case '1':
          return [dayjs(), dayjs()];
        case '2':
          return [dayjs().add(-1, 'day'), dayjs().add(-1, 'day')];
        case '3':
          return [dayjs().add(-1, 'week'), dayjs()];
        case '4':
          return [dayjs().add(-1, 'month'), dayjs()];
        default:
          return [dayjs(), dayjs()];
      }
    })();

    setPeriod(newPeriod);
  };

  const periodButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeDateRangeCardByKey = (e: KeyboardEvent<HTMLDivElement | HTMLButtonElement>) => {
    if (e.code !== 'Escape') return;
    setOpenDateRange(false);
  };

  const closeDateRangeCardByMouse = (e: any) => {
    setOpenDateRange(false);
  };

  const dateRangePickerChange = (newValue: DateRange<Date>) => {
    if (!dayjs(newValue[0])?.isValid() || !dayjs(newValue[1])?.isValid()) return;
    setPeriod([dayjs(newValue[0]), dayjs(newValue[1])]);
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="flex-start"
      alignItems="center"
      spacing={3}
    >
      <Grid
        container
        item
        justifyContent="center"
      >
        <CustomizedCard
          boxShadows={theme.palette.mode === ColorMode.Light}
          style={{ borderRadius: '4px' }}
        >
          <ToggleButtonGroup
            style={{
              borderRadius: 'var(--border-radius)',
              flexWrap: 'wrap'
            }}
            color="primary"
            value={periodType}
            exclusive
            onChange={handleChange}
          >
            <ToggleButton className={styles.ToggleButton} value="1">Сегодня</ToggleButton>
            <ToggleButton className={styles.ToggleButton} value="2">Вчера</ToggleButton>
            <ToggleButton className={styles.ToggleButton} value="3">Неделя</ToggleButton>
            <ToggleButton className={styles.ToggleButton} value="4">Месяц</ToggleButton>
            <ToggleButton
              className={styles.ToggleButton}
              value="5"
              ref={periodButtonRef}
              onKeyDown={closeDateRangeCardByKey}
            >
              {periodType === '5' ?
                <ButtonDateRangePicker
                  value={[period[0]?.toDate(), period[1]?.toDate()] as any}
                  onChange={dateRangePickerChange}
                  slots={{
                    field: DateRangeButtonField
                  }}
                />
                : 'Период'}
            </ToggleButton>
          </ToggleButtonGroup>
        </CustomizedCard>
      </Grid>
      <Grid container item>
        <DealsSummarize period={period} />
      </Grid>
      <Grid
        container
        item
        spacing={3}
        columns={{ xs: 12, lg: 12 }}
      >
        <Grid
          className={styles.TaskSummarize}
          container
          item
          spacing={3}
          columns={{ xs: 1, sm: 2, md: 4, lg: 12 }}
          xs={12}
          lg={5}
        >
          <TasksSummarize period={period} />
        </Grid>
        <Grid
          container
          item
          xs={12}
          lg={7}
        >
          <ChartDonut period={period} />
        </Grid>
      </Grid>
      <Grid container item>
        <ChartColumn />
      </Grid>
    </Grid>
  );
}

export default Dashboard;

