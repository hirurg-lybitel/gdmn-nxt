import SearchBar from '@gdmn-nxt/components/search-bar/search-bar';
import styles from './time-tracker.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  Stack,
  Typography,
  AccordionProps,
  AccordionSummaryProps,
  styled,
  Divider,
  Checkbox,
  Tooltip,
  TextField,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomLoadingButton from '@gdmn-nxt/components/helpers/custom-loading-button/custom-loading-button';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { IFilteringData, ITimeTrack } from '@gsbelarus/util-api-types';
import dayjs, { durationFormat } from '@gdmn-nxt/dayjs';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import { AddItem } from './components/add-item';
import { useAddTimeTrackingMutation, useDeleteTimeTrackingMutation, useGetTimeTrackingByDateQuery, useGetTimeTrackingInProgressQuery, useUpdateTimeTrackingMutation } from '../../../features/time-tracking';
import CircularIndeterminate from '@gdmn-nxt/components/helpers/circular-indeterminate/circular-indeterminate';
import MenuBurger from '@gdmn-nxt/components/helpers/menu-burger';
import ItemButtonDelete from '@gdmn-nxt/components/item-button-delete/item-button-delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { clearFilterData, saveFilterData } from '../../../store/filtersSlice';
import { useFilterStore } from '@gdmn-nxt/components/helpers/hooks/useFilterStore';
import ButtonDateRangePicker from '@gdmn-nxt/components/button-date-range-picker';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import CustomFilterButton from '@gdmn-nxt/components/helpers/custom-filter-button';
import FilterPanel from './components/filter-panel';
import EditableTypography from '@gdmn-nxt/components/editable-typography/editable-typography';
import { DateRange, DateRangeValidationError, PickerChangeHandlerContext } from '@mui/x-date-pickers-pro';
import TextFieldMasked from '@gdmn-nxt/components/textField-masked/textField-masked';

const durationMask = [
  /[0-9]/,
  /[0-9]/,
  ':',
  /[0-5]/,
  /[0-9]/,
  ':',
  /[0-5]/,
  /[0-9]/
];

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion
    disableGutters
    elevation={0}
    {...props}
  />
))(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'var(--color-paper-bg)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  // padding: theme.spacing(2),
  // borderTop: '1px solid rgba(0, 0, 0, .125)',
  borderTop: `1px solid ${theme.palette.divider}`
  // backgroundColor: 'var(--color-card-bg)',
}));

const filterEntityName = 'timeTracking';

export function TimeTracker() {
  const dispatch = useDispatch();
  const filterData = useSelector((state: RootState) => state.filtersStorage.filterData?.timeTracking) ?? {};
  const [openFilters, setOpenFilters] = useState(false);

  const {
    data: timeTrackGroup = [],
    isFetching,
    isLoading,
    refetch
  } = useGetTimeTrackingByDateQuery({
    ...(filterData && { filter: filterData }),
  });

  const {
    data: activeTimeTrack,
    refetch: refetchTimeTrackingInProgress
  } = useGetTimeTrackingInProgressQuery();
  const [addTimeTrack] = useAddTimeTrackingMutation();
  const [updateTimeTrack] = useUpdateTimeTrackingMutation();
  const [deleteTimeTrack] = useDeleteTimeTrackingMutation();

  const descriptionRef = useRef<HTMLInputElement>(null);
  const billableRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);

  const defaultFilter = useMemo(() => {
    const today = dayjs();
    return { period: [today.subtract(7, 'day').toDate()
      .getTime(), today.toDate().getTime()] };
  }, []);

  const [filtersIsLoading] = useFilterStore(filterEntityName, defaultFilter);

  const saveFilters = useCallback((filteringData: IFilteringData) => {
    dispatch(saveFilterData({ timeTracking: filteringData }));
  }, []);

  const handleFilteringDataChange = useCallback((newValue: IFilteringData) => saveFilters(newValue), []);

  const requestSearch = useCallback((value: string) => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange({
      ...newObject,
      ...(value !== '' ? { name: [value] } : {})
    });
    // setPaginationData(prev => ({ ...prev, pageNo: 0 }));
  }, [filterData]);

  const cancelSearch = useCallback(() => {
    const newObject = { ...filterData };
    delete newObject.name;
    handleFilteringDataChange(newObject);
  }, [filterData]);

  const filterHandlers = {
    filterClick: useCallback(() => {
      setOpenFilters(true);
    }, []),
    filterClose: useCallback(() => {
      setOpenFilters(false);
    }, [setOpenFilters]),
    // filterClear: useCallback(() => {
    //   dispatch(clearFilterData(filterEntityName));
    // }, [dispatch]),
    filterClear: useCallback(() => {
      saveFilters({ period: filterData.period });
    }, [filterData.period])
  };

  const Header = useMemo(() => {
    return (
      <CustomizedCard
        direction="row"
        className={styles.headerCard}
      >
        <Typography variant="pageHeader">Учёт времени</Typography>
        <Box flex={1} />
        <Box
          pr={1}
        >
          <SearchBar
            disabled={isLoading}
            onCancelSearch={cancelSearch}
            onRequestSearch={requestSearch}
            cancelOnEscape
            placeholder="Поиск"
            value={
              filterData && filterData.name
                ? filterData.name[0]
                : undefined
            }
          />
        </Box>
        <CustomLoadingButton
          hint="Обновить данные"
          loading={isFetching}
          onClick={() => {
            refetch();
            refetchTimeTrackingInProgress();
          }}
        />
        <Box display="inline-flex" alignSelf="center">
          <CustomFilterButton
            onClick={filterHandlers.filterClick}
            disabled={isFetching}
            hasFilters={Object.keys(filterData || {}).filter(f => f !== 'period').length > 0}
          />
        </Box>
      </CustomizedCard>
    );
  }, [
    isFetching,
    isLoading,
    refetch,
    refetchTimeTrackingInProgress,
    filterData
  ]);

  const handleSubmit = (value: ITimeTrack, mode: 'add' | 'update') => {
    if (mode === 'update') {
      updateTimeTrack(value);
      return;
    }
    addTimeTrack(value);

    setAddTimeTrackInitial({
      date: value.date
    });
  };

  const onDelete = (id: number) => () => {
    deleteTimeTrack(id);
  };

  const handleStopPropagation = (e: any) => {
    e.stopPropagation();
  };

  const [addTimeTrackInitial, setAddTimeTrackInitial] = useState<Partial<ITimeTrack> | undefined>();

  useEffect(() => {
    setAddTimeTrackInitial(activeTimeTrack);
  }, [activeTimeTrack]);

  const setInitial = (
    value: any
  ) => (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    handleStopPropagation(e);
    setAddTimeTrackInitial({ ...value });
  };

  const memoFilter = useMemo(() =>
    <FilterPanel
      open={openFilters}
      onClose={filterHandlers.filterClose}
      filteringData={filterData}
      onFilteringDataChange={handleFilteringDataChange}
      onClear={filterHandlers.filterClear}

    />,
  [openFilters, filterData, filterHandlers.filterClear, filterHandlers.filterClose, handleFilteringDataChange]);

  const defaultShortcut = useMemo(() => filtersIsLoading || filterData.period ? undefined : 'Последние 7 дней', [filtersIsLoading]);

  const dateRangeOnChange = (value: DateRange<Date>, context: PickerChangeHandlerContext<DateRangeValidationError>) => {
    const newPeriod = [
      value[0]?.getTime() ?? null,
      value[1]?.getTime() ?? null
    ];
    const newObject = { ...filterData };
    delete newObject.period;
    handleFilteringDataChange({
      ...newObject,
      ...((newPeriod[0] !== null && newPeriod[1] !== null) ? { period: [...newPeriod] } : {})
    });
  };

  const descriptionOnClose = (timeTrack: ITimeTrack) => () => {
    const description = descriptionRef.current?.value;

    updateTimeTrack({ ...timeTrack, description });
  };

  const billableOnChange = (
    timeTrack: ITimeTrack
  ) => (
    e: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    updateTimeTrack({ ...timeTrack, billable: checked });
  };

  const durationOnClose = (timeTrack: ITimeTrack) => () => {
    const value = durationRef.current?.value ?? '';

    const [hours, minutes, seconds] = value
      .replaceAll('_', '0')
      .split(':')
      .map(Number);

    const newDuration = dayjs.duration({ hours, minutes, seconds });
    const isoDuration = newDuration.toISOString();
    const duration = isoDuration;
    const startTime = dayjs(timeTrack.startTime);
    const endTime = startTime.add(newDuration).toDate();

    updateTimeTrack({
      ...timeTrack,
      duration,
      endTime
    });
  };

  return (
    <Stack flex={1} spacing={3}>
      {memoFilter}
      {Header}
      <AddItem
        initial={addTimeTrackInitial}
        onSubmit={handleSubmit}
      />
      <Stack direction="row">
        <ButtonDateRangePicker
          value={filterData.period?.map((date: string) => new Date(Number(date))) ?? [null, null]}
          defaultShortcut={defaultShortcut}
          onChange={dateRangeOnChange}
        />
        <Box flex={1} />
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          mr={'16px'}
        >
          <Typography variant="caption">
            Итого за период:
          </Typography>
          <Typography fontWeight={600} width={60}>
            {durationFormat(timeTrackGroup.reduce((total, { duration }) =>
              dayjs
                .duration(total.length === 0 ? Object.assign({}) : total)
                .add(
                  dayjs
                    .duration(duration)
                )
                .toISOString()
            , ''))}
          </Typography>
        </Stack>
      </Stack>
      {isLoading ?
        <CircularIndeterminate open size={70} /> :
        <CustomizedScrollBox container={{ style: { marginRight: '-16px' } }}>
          <Stack spacing={2} mr={2}>
            {timeTrackGroup.map(({ date, duration, items }, idx) => {
              return (
                <CustomizedCard key={idx}>
                  <Accordion defaultExpanded={false}>
                    <AccordionSummary>
                      <Stack
                        direction="row"
                        spacing={1}
                        flex={1}
                        alignItems="center"
                      >
                        <Typography fontWeight={600} textTransform="capitalize" >
                          {dayjs(date).format('MMM D, YYYY')}
                        </Typography>
                        <Box flex={1} />
                        <Typography variant="caption">
                          Итого:
                        </Typography>
                        <Typography fontWeight={600} width={60}>
                          {durationFormat(duration)}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails style={{ padding: '0 16px' }}>
                      {items.map(item => {
                        const {
                          ID,
                          customer,
                          workProject,
                          description = '',
                          startTime,
                          endTime,
                          duration,
                          billable = true,
                          task,
                          user
                        } = item;

                        return (
                          <Stack
                            key={ID}
                            direction="row"
                            spacing={2}
                            alignItems={'center'}
                            sx={{
                              borderBottom: '1px solid',
                              borderBottomColor: 'divider',
                              padding: '8px 0px',
                              ':last-child': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <Stack flex={1}>
                              {(filterData.allEmployees || (filterData.employees?.length ?? 0) > 0) && <Typography variant={'caption'}>{user?.CONTACT?.NAME}</Typography>}
                              <Stack direction="row" spacing={0.5}>
                                <Typography
                                  variant={'caption'}
                                  onClick={setInitial({ customer, task: {} })}
                                  style={{
                                    cursor: 'pointer'
                                  }}
                                >
                                  {customer?.NAME}
                                </Typography>
                                <Typography
                                  variant={'caption'}
                                  onClick={setInitial({ customer, workProject, task: {} })}
                                  style={{
                                    cursor: 'pointer'
                                  }}
                                >
                                  {`→ ${workProject?.NAME}`}
                                </Typography>
                                <Typography
                                  variant={'caption'}
                                  onClick={setInitial({ customer, workProject, task })}
                                  style={{
                                    cursor: 'pointer'
                                  }}
                                >
                                  {task ? `→ ${task.name}` : ''}
                                </Typography>
                              </Stack>
                              <EditableTypography
                                value={description}
                                editEmpty={false}
                                onClose={descriptionOnClose(item)}
                                editComponent={
                                  <TextField
                                    inputRef={descriptionRef}
                                    multiline
                                    minRows={1}
                                    autoFocus
                                    defaultValue={description}
                                    fullWidth
                                  />
                                }
                              />
                            </Stack>
                            <Divider orientation="vertical" flexItem />
                            <Tooltip title={billable ? 'Оплачиваемый' : 'Неоплачиваемый'}>
                              <Checkbox
                                inputRef={billableRef}
                                size="small"
                                icon={<MonetizationOnOutlinedIcon fontSize="medium" />}
                                checkedIcon={<MonetizationOnIcon fontSize="medium" />}
                                sx={{
                                  height: 34,
                                  width: 34,
                                }}
                                checked={billable}
                                onChange={billableOnChange(item)}
                              />
                            </Tooltip>
                            <Divider orientation="vertical" flexItem />
                            <Typography>{`${startTime ? dayjs(startTime).format('HH:mm') : ''} - ${endTime ? dayjs(endTime).format('HH:mm') : ''}`}</Typography>
                            <Divider orientation="vertical" flexItem />
                            <EditableTypography
                              containerStyle={{
                                maxWidth: 128
                              }}
                              value={durationFormat(duration)}
                              onClose={durationOnClose(item)}
                              editComponent={
                                <TextFieldMasked
                                  style={{
                                    maxWidth: 86
                                  }}
                                  inputRef={durationRef}
                                  autoFocus
                                  mask={durationMask}
                                  defaultValue={durationFormat(duration)}
                                />
                              }
                            />
                            <MenuBurger
                              items={[
                                <ItemButtonDelete
                                  key="delete"
                                  label="Удалить"
                                  title="Удалить запись?"
                                  text={'Данные невозможно будет восстановить'}
                                  onClick={onDelete(ID)}
                                />
                              ]}
                            />
                          </Stack>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                </CustomizedCard>
              );
            })}
          </Stack>
        </CustomizedScrollBox>}
    </Stack>
  );
};
