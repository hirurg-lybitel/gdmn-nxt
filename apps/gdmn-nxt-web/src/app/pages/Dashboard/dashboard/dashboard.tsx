import { Box, ClickAwayListener, Grid, Popper, TextField, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import ChartColumn from '../../../components/Charts/chart-column/chart-column';
import ChartDonut from '../../../components/Charts/chart-donut/chart-donut';
import EarningCard from '../../../components/Charts/earning-card/earning-card';
import OrderCard from '../../../components/Charts/order-card/order-card';
import './dashboard.module.less';
import CustomizedCard from '../../../components/Styled/customized-card/customized-card';
import { DealsSummarize } from './deals-summarize';
import { TasksSummarize } from './tasks-summarize';
import { KeyboardEvent, useRef, useState } from 'react';
import { DateRange, DateRangeCalendar } from '@mui/x-date-pickers-pro';
import dayjs, { Dayjs } from '@gdmn-nxt/dayjs';
import { ColorMode } from '@gsbelarus/util-api-types';
import customParseFormat from 'dayjs/plugin/customParseFormat';

const dateFormat = 'DD.MM.YYYY';

/* eslint-disable-next-line */
export interface DashboardProps {}

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

  const dateRangePickerChange = (newValue: DateRange<dayjs.Dayjs>) => {
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
              height: '50px',
            }}
            color="primary"
            value={periodType}
            exclusive
            onChange={handleChange}
          >
            <ToggleButton value="1">Сегодня</ToggleButton>
            <ToggleButton value="2">Вчера</ToggleButton>
            <ToggleButton value="3">Неделя</ToggleButton>
            <ToggleButton value="4">Месяц</ToggleButton>
            <ToggleButton
              value="5"
              ref={periodButtonRef}
              onKeyDown={closeDateRangeCardByKey}
            >
              {periodType === '5' ?
                <div>
                  <TextField
                    variant="standard"
                    style={{ height: '26px', width: '180px' }}
                    value={`${dayjs(period[0], dateFormat)?.toDate()
                      .toLocaleDateString()} - ${dayjs(period[1], dateFormat)?.toDate()
                      .toLocaleDateString()}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDateRange(true);
                    }}
                    onChange={(e) => {
                      const period = e.target.value.split(' - ');

                      if (!dayjs(period[0], dateFormat)?.isValid() || !dayjs(period[1], dateFormat)?.isValid()) return;
                      setPeriod([dayjs(period[0], dateFormat), dayjs(period[1], dateFormat)]);
                    }}
                  />
                  <ClickAwayListener
                    onClickAway={closeDateRangeCardByMouse}
                  >
                    <Popper
                      open={openDateRange}
                      anchorEl={periodButtonRef.current}
                      onKeyDown={closeDateRangeCardByKey}
                    >
                      <CustomizedCard borders>
                        <DateRangeCalendar
                          value={[period[0]?.toDate(), period[1]?.toDate()] as any}
                          onChange={dateRangePickerChange}
                        />
                      </CustomizedCard>
                    </Popper>
                  </ClickAwayListener>
                </div>
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
          container
          item
          spacing={3}
          columns={{ sm: 2, md: 4, lg: 12 }}
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

