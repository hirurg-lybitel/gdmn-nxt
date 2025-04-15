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
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomLoadingButton from '@gdmn-nxt/helpers/custom-loading-button/custom-loading-button';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { IFilteringData, ITimeTrack } from '@gsbelarus/util-api-types';
import dayjs, { durationFormat } from '@gdmn-nxt/dayjs';
import CustomizedScrollBox from '@gdmn-nxt/components/Styled/customized-scroll-box/customized-scroll-box';
import { AddItem } from './components/add-item';
import { useAddTimeTrackingMutation, useDeleteTimeTrackingMutation, useGetTimeTrackingByDateQuery, useGetTimeTrackingInProgressQuery, useUpdateTimeTrackingMutation } from '../../../features/time-tracking';
import MenuBurger from '@gdmn-nxt/helpers/menu-burger';
import ItemButtonDelete from '@gdmn-nxt/components/customButtons/item-button-delete/item-button-delete';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@gdmn-nxt/store';
import { saveFilterData } from '@gdmn-nxt/store/filtersSlice';
import ButtonDateRangePicker from '@gdmn-nxt/components/button-date-range-picker';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import CustomFilterButton from '@gdmn-nxt/helpers/custom-filter-button';
import FilterPanel from './components/filter-panel';
import { DateRange, DateRangeValidationError, PickerChangeHandlerContext } from '@mui/x-date-pickers-pro';
import TextFieldMasked from '@gdmn-nxt/components/textField-masked/textField-masked';
import Confirmation from '@gdmn-nxt/helpers/confirmation';
import ItemButtonEdit from '@gdmn-nxt/components/customButtons/item-button-edit/item-button-edit';
import ItemButtonCancel from '@gdmn-nxt/components/customButtons/item-button-cancel/item-button-cancel';
import ItemButtonSave from '@gdmn-nxt/components/customButtons/item-button-save/item-button-save';
import { Form, FormikProvider, useFormik } from 'formik';
import useConfirmation from '@gdmn-nxt/helpers/hooks/useConfirmation';
import PageHeader from '@gdmn-nxt/components/pageHeader/pageHeader';

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

  useEffect(() => {
    if (filterData?.period) {
      return;
    }

    const today = dayjs();

    dateRangeOnChange([
      today.subtract(7, 'day').toDate(),
      today.toDate()
    ]);
  }, []);

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
    }, [filterData.period, saveFilters])
  };

  const theme = useTheme();
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const Header = useMemo(() => (
    <PageHeader
      title={'Учёт времени'}
      isLoading={isLoading}
      isFetching={isFetching}
      onCancelSearch={cancelSearch}
      onRequestSearch={requestSearch}
      searchValue={filterData.name?.[0]}
      onRefetch={() => {
        refetch();
        refetchTimeTrackingInProgress();
      }}
      onFilterClick={filterHandlers.filterClick}
      hasFilters={Object.keys(filterData || {}).filter(f => f !== 'period').length > 0}
    />
  ), [cancelSearch, filterData, filterHandlers.filterClick, isFetching, isLoading, refetch, refetchTimeTrackingInProgress, requestSearch]);

  const handleSubmit = (value: ITimeTrack, mode: 'add' | 'update') => {
    if (mode === 'update') {
      updateTimeTrack(value);
      return;
    }
    addTimeTrack(value);
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

  const dateRangeOnChange = (value: DateRange<Date>, context?: PickerChangeHandlerContext<DateRangeValidationError>) => {
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

  return (
    <Stack flex={1} spacing={3}>
      {memoFilter}
      {Header}
      <AddItem
        initial={addTimeTrackInitial}
        onSubmit={handleSubmit}
      />
      <Stack
        direction={matchDownSm ? 'column' : 'row'}
        sx={{
          alignItems: matchDownSm ? 'flex-end' : 'auto'
        }}
      >
        <div style={{ display: 'flex', width: '100%' }}>
          <ButtonDateRangePicker
            options={['Последние 7 дней', 'Прошлая неделя', 'Прошлый месяц', 'Сбросить', 'Текущий месяц', 'Эта неделя']}
            value={filterData.period?.map((date: string) => new Date(Number(date))) ?? [null, null]}
            onChange={dateRangeOnChange}
            sx={{
              ...matchDownSm && { width: '100%' },
            }}
          />
        </div>
        <Box flex={1} />
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          mr={'16px'}
          ml={matchDownSm ? '0px' : '16px'}
          mt={matchDownSm ? '16px' : '0px'}
        >
          <Typography variant="caption" style={{ textWrap: 'nowrap' }}>
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
      <div style={{ height: '100%', minHeight: '300px', position: 'relative' }}>
        <div className={styles.scrollbarContainer} style={{ position: 'absolute', inset: 0, overflowY: 'scroll', marginRight: '-16px' }}>
          <Stack
            spacing={2}
            mr={'6px'}
          >
            {isLoading ?
              <ItemsSkeleton /> :
              timeTrackGroup.map(({ date, duration, items }, idx) => {
                return (
                  <CustomizedCard key={idx}>
                    <Accordion
                      defaultExpanded={false}
                      sx={{
                        '& .MuiCollapse-root': {
                          overflowX: 'auto'
                        },
                        '& .MuiCollapse-wrapper': {
                          minWidth: '555px'
                        }
                      }}
                    >
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
                        {items.map((item, index) => (
                          <>
                            <TimeTrackerItem
                              key={item.ID}
                              item={item}
                              isFetching={isFetching}
                              filterData={filterData}
                              setInitial={setInitial}
                              lastItem={items.length - 1 === index}
                            />
                          </>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </CustomizedCard>
                );
              })}
          </Stack>
        </div>
      </div>
    </Stack>
  );
};


const ItemsSkeleton = () => (
  [...Array(10).keys()].map(item => (
    <Skeleton
      key={item}
      variant="rounded"
      animation="wave"
      style={{
        borderRadius: 'var(--border-radius)',
        height: 48,
        width: 'auto'
      }}
    />
  ))

);

interface ITimeTrackerItemProps {
  item: ITimeTrack,
  isFetching: boolean,
  filterData: IFilteringData,
  setInitial: (value: any) => (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void,
  lastItem: boolean
}

const TimeTrackerItem = (props: ITimeTrackerItemProps) => {
  const {
    isFetching,
    filterData,
    setInitial,
    item,
    lastItem
  } = props;

  const {
    ID,
    customer,
    description = '',
    startTime: startTimeValue,
    endTime: endTimeValue,
    duration,
    billable = true,
    task,
    user,
  } = props.item;

  const [updateTimeTrack, { isLoading: updateIsLoading }] = useUpdateTimeTrackingMutation();
  const [deleteTimeTrack, { isLoading: deleteIsLoading }] = useDeleteTimeTrackingMutation();

  const formik = useFormik<ITimeTrack>({
    enableReinitialize: true,
    validateOnBlur: false,
    initialValues: {
      ...item
    },
    onSubmit: (values, { resetForm }) => {
      resetForm();
      handleCancelClick();
      updateTimeTrack(values);
    },
  });


  const onDelete = (id: number) => () => {
    deleteTimeTrack(id);
  };

  const [editMode, setEditMode] = useState(false);

  const endTime = useMemo(() => editMode ? formik.values.endTime : endTimeValue, [editMode, endTimeValue, formik.values.endTime]);
  const startTime = useMemo(() => editMode ? formik.values.startTime : startTimeValue, [editMode, startTimeValue, formik.values.endTime]);

  const [confirmDialog] = useConfirmation();

  const handleEditClick = () => {
    setEditMode(true);
  };

  const onClose = () => {
    setEditMode(false);
    formik.resetForm();
  };

  const handleCancelClick = () => {
    if (formik.dirty) {
      confirmDialog.setOpen(true);
      confirmDialog.setOptions({
        title: 'Внимание',
        text: 'Изменения будут утеряны. Продолжить?',
        dangerous: true,
        confirmClick: () => {
          confirmDialog.setOpen(false);
          onClose();
        },
      });
      return;
    }

    onClose();
  };

  const durationOnChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const [hours, minutes, seconds] = e.target.value
      .replaceAll('_', '0')
      .split(':')
      .map(Number);

    const newDuration = dayjs.duration({ hours, minutes, seconds });
    const isoDuration = newDuration.toISOString();
    formik.setFieldValue('duration', isoDuration);

    const startTime = dayjs(formik.values.startTime);
    formik.setFieldValue('endTime', startTime.add(newDuration).toDate());
  };

  const billableChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    formik.setFieldValue('billable', checked);
  };

  if (isFetching || updateIsLoading || deleteIsLoading) {
    return (
      <Skeleton
        variant="rounded"
        animation="wave"
        style={{
          borderRadius: 'var(--border-radius)',
          height: 58,
          width: 'auto',
          margin: '10px 0px'
        }}
      />
    );
  }

  return (
    <FormikProvider value={formik}>
      <Form
        id="timeTrackingItemForm"
        onSubmit={formik.handleSubmit}
      >
        {confirmDialog.dialog}
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
                onClick={setInitial({ customer, task: {} })}
                style={{
                  cursor: 'pointer'
                }}
              >
                {task?.project && `→ ${task?.project?.name}`}
              </Typography>
              <Typography
                variant={'caption'}
                onClick={setInitial({ customer, task })}
                style={{
                  cursor: 'pointer'
                }}
              >
                {task ? `→ ${task.name}` : ''}
              </Typography>
            </Stack>
            {editMode ? (
              <TextField
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                multiline
                minRows={1}
                autoFocus
                fullWidth
              />
            ) : <div style={{ minHeight: '32px', display: 'flex', alignItems: 'center' }}>{description}</div>}
          </Stack>
          <Divider orientation="vertical" flexItem />
          <Tooltip title={billable ? 'Оплачиваемый' : 'Неоплачиваемый'}>
            {editMode ? (
              <Checkbox
                size="small"
                icon={<MonetizationOnOutlinedIcon fontSize="medium" />}
                checkedIcon={<MonetizationOnIcon fontSize="medium" />}
                sx={{
                  height: 34,
                  width: 34,
                }}
                checked={formik.values.billable}
                onChange={billableChange}
              />
            )
              : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5px' }}>
                  {billable ? <MonetizationOnIcon color="primary" fontSize="medium" /> : <MonetizationOnOutlinedIcon style={{ color: 'rgba(255, 255, 255, 0.7)' }} fontSize="medium" />}
                </div>
              )}
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Typography>{`${startTime ? dayjs(startTime).format('HH:mm') : ''} - ${endTime ? dayjs(endTime).format('HH:mm') : ''}`}</Typography>
          <Divider orientation="vertical" flexItem />
          {editMode ? (
            <TextFieldMasked
              style={{
                maxWidth: 86
              }}
              autoFocus
              mask={durationMask}
              onChange={durationOnChange}
              value={durationFormat(formik.values.duration)}
            />
          ) : <div style={{ marginLeft: '16px' }}>{durationFormat(duration)}</div>}
          <MenuBurger
            items={({ closeMenu }) => [
              editMode ? (
                <ItemButtonSave
                  key="save"
                  size={'small'}
                  label="Сохранить"
                  onClick={(e) => {
                    formik.handleSubmit();
                    closeMenu();
                  }}
                />)
                : <></>,
              editMode
                ? (
                  <ItemButtonCancel
                    key="cancel"
                    label={'Отменить'}
                    onClick={(e) => {
                      handleCancelClick();
                      closeMenu();
                    }}
                  />)
                : <></>,
              !editMode
                ? (
                  <ItemButtonEdit
                    key="edit"
                    size={'small'}
                    label="Редактировать"
                    onClick={(e) => {
                      handleEditClick();
                      closeMenu();
                    }}
                  />)
                : <></>,
              <Confirmation
                key="delete"
                title="Удалить запись?"
                text={'Данные невозможно будет восстановить'}
                dangerous
                onConfirm={onDelete(ID)}
                onClose={closeMenu}
              >
                <ItemButtonDelete
                  label="Удалить"
                  confirmation={false}
                />
              </Confirmation>,
            ]}
          />
        </Stack>
      </Form>
      {!lastItem && <Divider/>}
    </FormikProvider>
  );
};
