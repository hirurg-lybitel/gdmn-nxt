import styles from './styles.module.less';
import CustomizedCard from '@gdmn-nxt/components/Styled/customized-card/customized-card';
import { Autocomplete, Box, Button, Checkbox, createFilterOptions, List, ListItem, ListItemButton, ListItemText, ListSubheader, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DatePicker, TimePicker, TimeValidationError } from '@mui/x-date-pickers-pro';
import { Form, FormikProvider, getIn, useFormik } from 'formik';
import { ChangeEvent, forwardRef, HTMLAttributes, MouseEvent, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import EditNoteIcon from '@mui/icons-material/EditNote';
import StopIcon from '@mui/icons-material/Stop';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { CustomerSelect } from '@gdmn-nxt/components/selectors/customer-select/customer-select';
import { ICustomer, ITimeTrack, ITimeTrackProject, ITimeTrackTask } from '@gsbelarus/util-api-types';
import dayjs, { durationFormat } from '@gdmn-nxt/dayjs';
import * as yup from 'yup';
import TextFieldMasked from '@gdmn-nxt/components/textField-masked/textField-masked';
import { GroupHeader, GroupItems } from '@gdmn-nxt/components/Kanban/kanban-edit-card/components/group';
import SwitchStar from '@gdmn-nxt/components/switch-star/switch-star';
import { useAddFavoriteTaskMutation, useDeleteFavoriteTaskMutation, useGetProjectsQuery } from 'apps/gdmn-nxt-web/src/app/features/time-tracking';

import { useGetCustomersQuery } from 'apps/gdmn-nxt-web/src/app/features/customer/customerApi_new';

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

type CalcMode = 'calc' | 'manual';
type SubmitMode = 'add' | 'update';

interface AddItemProps {
  initial?: Partial<ITimeTrack>;
  onSubmit: (value: ITimeTrack, mode: SubmitMode) => void;
}

const TasksListboxComponent = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLElement>
>(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;

  return (
    <List
      {...other}
      subheader={<li />}
      dense
      disablePadding
      ref={ref}
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        zIndex: 0,
        '& ul': {
          padding: 0,
          flex: 1
        },
      }}
    >
      {children}
    </List>
  );
});

export const AddItem = ({
  initial,
  onSubmit
}: AddItemProps) => {
  const [calcMode, setCalcMode] = useState<CalcMode>(initial?.inProgress ? 'calc' : 'manual');
  const [submitMode, setSubmitMode] = useState<SubmitMode>('add');
  const [isValidTimers, toggleValidTimers] = useState(true);
  const currentDate = useMemo(() => dayjs().toDate(), []);

  const calcModeChange = (
    event: MouseEvent<HTMLElement>,
    newAlignment: CalcMode | null,
  ) => {
    newAlignment && setCalcMode(newAlignment);
  };

  const initialValues = {
    ID: -1,
    date: currentDate,
    customer: null,
    startTime: currentDate,
    endTime: null,
    description: '',
    inProgress: false,
    billable: true,
    task: undefined,
  };

  const formik = useFormik<ITimeTrack>({
    enableReinitialize: true,
    initialValues: {
      ...initialValues,
      ...initial,
      ...(initial?.date && {
        date: dayjs(initial.date).toDate()
      }),
      ...(initial?.startTime && {
        startTime: dayjs(initial.startTime).toDate()
      }),
      ...(initial?.endTime && {
        endTime: dayjs(initial.endTime).toDate()
      }),
    },
    validationSchema: yup.object().shape({
      date: yup.date().required('Не указана дата')
    }),
    onSubmit: (values, { resetForm }) => {
      if (!isValidTimers) {
        return;
      }

      onSubmit(values, submitMode);
      resetForm();

      /** Устанавливаем выбранную дату, чтобы можно было добавить несколько записей за прошедший день без перевыбора даты*/
      formik.setFieldValue('date', values.date);
    },
  });

  useEffect(() => {
    if (!formik.values.inProgress) {
      return;
    }

    setCalcMode('calc');

    const clockId = setInterval(() => {
      const startTime = dayjs(formik.values.startTime);
      const endTime = dayjs();
      const duration = dayjs.duration(endTime.diff(startTime));

      formik.setFieldValue('duration', duration.toISOString());
    }, 1000);

    return () => {
      clearInterval(clockId);
    };
  }, [formik, formik.values.inProgress]);

  const calcDuration = useCallback((
    startTime?: Date | null,
    endTime?: Date | null
  ) => {
    if (!endTime || !startTime) {
      return;
    }

    const dStartTime = dayjs(startTime);
    const dEndTime = dayjs(endTime);

    if (dEndTime.isBefore(dStartTime)) {
      return;
    }

    const duration = dayjs.duration(dEndTime.diff(dStartTime));
    formik.setFieldValue('duration', duration.toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    calcDuration(
      formik.values.startTime,
      formik.values.endTime
    );
  }, [formik.values.startTime, formik.values.endTime, calcDuration]);

  const handleCustomerChange = useCallback((customer: ICustomer | null | undefined) => {
    formik.setFieldValue('customer', customer);
  }, [formik]);

  const handleDateTimeChange = (fieldName: string) => (value: Date | null) => {
    if (!dayjs(value).isValid()) {
      return;
    }

    formik.setFieldValue(fieldName, value);

    formik.values.date?.setSeconds(0, 0);
    formik.values.startTime?.setSeconds(0, 0);
    formik.values.endTime?.setSeconds(0, 0);
  };

  const startClick = () => {
    setSubmitMode('add');
    formik.setFieldValue('date', dayjs().toDate());
    formik.setFieldValue('startTime', dayjs().toDate());
    formik.setFieldValue('endTime', null);
    formik.setFieldValue('inProgress', true);

    formik.submitForm();
  };

  const stopClick = () => {
    setSubmitMode('update');
    formik.setFieldValue('endTime', dayjs().toDate());
    formik.setFieldValue('inProgress', false);

    const startTime = dayjs(formik.values.startTime);
    const endTime = dayjs(formik.values.endTime);

    const duration = dayjs.duration(endTime.diff(startTime));
    formik.setFieldValue('duration', duration.toISOString());

    toggleValidTimers(true);

    formik.submitForm();
  };

  const addClick = () => {
    setSubmitMode('add');
    formik.submitForm();
  };

  const timePickerOnError = (e: TimeValidationError, v: Date | null) => toggleValidTimers(!e);

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

  const handleTaskSelected = async (task: ITimeTrackTask | null) => {
    formik.setFieldValue('task', task);
  };

  const [descriptionOnFocus, setDescriptionOnFocus] = useState(false);

  const theme = useTheme();
  const matchDownLg = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  const matchDownSm = useMediaQuery(theme.breakpoints.down('sm'));

  const filterProjects = (limit = 50) => createFilterOptions({
    matchFrom: 'any',
    ignoreCase: true,
    stringify: (option: ITimeTrackProject) => `${option.name} ${option.tasks?.map(task => task.name).join(' ')}`,
  });

  const [selectedProject, setSelectedProject] = useState<ITimeTrackProject | null>(null);

  const projectOnChange = (
    e: SyntheticEvent,
    value: ITimeTrackProject | null
  ) => {
    setSelectedProject(value);
  };

  // useEffect(() => {
  //   if (!formik.values.task?.project) {
  //     return;
  //   }

  //   setSelectedProject(formik.values.task?.project);
  // }, [formik.values.task?.project]);

  const [addFavoriteTask] = useAddFavoriteTaskMutation();
  const [deleteFavoriteTask] = useDeleteFavoriteTaskMutation();

  const toggleTaskFavorite = (taskId: number, projectId: number, favorite: boolean) => (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    e.stopPropagation();
    if (favorite) {
      deleteFavoriteTask({ taskId, projectId });
    } else {
      addFavoriteTask({ taskId, projectId });
    }
  };

  function preventAction<T>(e: MouseEvent<T>) {
    e.stopPropagation();
    e.preventDefault();
  }

  const {
    data,
    isLoading: projectsIsLoading,
    isFetching: projectsIsFetching
  } = useGetProjectsQuery({
    ...(!Array.isArray(formik.values.customer)
      ? { filter: { customerId: formik.values.customer?.ID, groupByFavorite: true, taskisActive: true, status: 'active' } }
      : {}),
  }, {
    skip: !formik.values.customer
  });

  const { data: customersResponse, isLoading: customersIsLoading, isFetching: customersIsFetching } = useGetCustomersQuery({
    filter: {
      withTasks: true
    }
  });

  const taskCount = useMemo(() => (
    customersResponse?.data.find((customer: ICustomer) => customer.ID === formik.values.customer?.ID)?.taskCount ?? 0
  ), [customersResponse?.data, formik.values.customer?.ID]);

  return (
    <CustomizedCard className={styles.itemCard}>
      <FormikProvider value={formik}>
        <Form id="timeTrackingForm" onSubmit={formik.handleSubmit}>
          <Stack
            direction={matchDownLg ? 'column' : 'row'}
            spacing={2}
            alignItems="center"
          >
            <Stack
              width={matchDownLg ? '100%' : undefined}
              spacing={{ xs: 2, lg: 1 }}
              flex={1}
            >
              <CustomerSelect
                disableEdition
                disableCaption
                disableFavorite={false}
                withTasks
                // showTasks
                debt
                agreement
                required
                value={formik.values.customer}
                onChange={handleCustomerChange}
                task={formik.values.task}
                onTaskSelected={handleTaskSelected}
                error={getIn(formik.touched, 'customer') && Boolean(getIn(formik.errors, 'customer'))}
                helperText={getIn(formik.touched, 'customer') && getIn(formik.errors, 'customer')}
              />
              {matchDownMd && formik.values.customer && data?.projects && data?.projects.length !== 0 && (
                <Autocomplete
                  disabled={projectsIsLoading || projectsIsFetching}
                  // style={{ marginTop: '16px' }}
                  ListboxComponent={TasksListboxComponent}
                  options={data?.projects || null}
                  getOptionLabel={() => formik.values.task?.name ?? ''}
                  filterOptions={filterProjects()}
                  onChange={projectOnChange}
                  value={selectedProject}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant={'outlined'}
                      placeholder="Выберите задачу"
                      label={'Задача'}
                      InputProps={{
                        ref: params.InputProps.ref,
                        endAdornment: params.InputProps.endAdornment
                      }}
                    />
                  )}
                  groupBy={({ isFavorite }: ITimeTrackProject) => isFavorite ? 'Избранные' : 'Остальные'}
                  renderGroup={(params) => (
                    <li key={params.key}>
                      <GroupHeader>
                        <Typography variant="subtitle1">{params.group}</Typography>
                      </GroupHeader>
                      <GroupItems>{params.children}</GroupItems>
                    </li>
                  )}
                  renderOption={(props, { tasks, ...option }) => (
                    <li
                      {...props}
                      key={`section-${option.ID}`}
                      style={{
                        padding: 0,
                      }}
                    >
                      <ul>
                        <ListSubheader
                          style={{
                            zIndex: 0,
                            lineHeight: '36px',
                            cursor: 'text',
                          }}
                          onClick={preventAction<HTMLLIElement>}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            {option.name}
                          </div>
                        </ListSubheader>
                        {tasks?.map(task => (
                          <ListItem
                            key={`item-${option.ID}-${task.ID}`}
                            onClick={() => handleTaskSelected({ ...task, project: option })}
                            disablePadding
                            style={{
                              backgroundColor: 'var(--color-main-bg)',
                            }}
                          >
                            <ListItemButton>
                              <ListItemText inset primary={task.name} />
                              <Box flex={1} minWidth={12} />
                              <SwitchStar
                                selected={!!task.isFavorite}
                                onClick={toggleTaskFavorite(task.ID, option.ID, !!task.isFavorite)}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </ul>
                    </li>
                  )}
                />
              )}
              <div style={{ height: '40px', width: '100%', position: 'relative' }}>
                <TextField
                  placeholder="Над чем вы работали?"
                  name="description"
                  multiline
                  {...(!descriptionOnFocus && { rows: 1 })}
                  fullWidth
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--color-paper-bg)',
                    zIndex: 2
                  }}
                  onFocus={() => setDescriptionOnFocus(true)}
                  onBlur={() => setDescriptionOnFocus(false)}
                />
              </div>
            </Stack>
            {calcMode === 'manual' &&
              <Stack
                width={matchDownLg ? '100%' : 216}
                spacing={{ xs: 2, lg: 1 }}
                direction={matchDownLg ? 'row' : 'column'}
              >
                <DatePicker
                  slotProps={{ textField: { placeholder: 'Сегодня' } }}
                  value={formik.values.date}
                  onChange={handleDateTimeChange('date')}
                  sx={{
                    '& .MuiInputBase-root': {
                      paddingRight: 1,
                    },
                    width: matchDownLg ? '100%' : undefined
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                >
                  <TimePicker
                    className={styles.selectTime}
                    slotProps={{
                      textField: {
                        sx: {
                          '& .MuiInputBase-root': {
                            paddingRight: 1,
                          }
                        }
                      },
                    }}
                    views={['hours', 'minutes']}
                    name="startTime"
                    value={formik.values.startTime}
                    onChange={handleDateTimeChange('startTime')}
                    onError={timePickerOnError}
                  />
                  <div>-</div>
                  <TimePicker
                    className={styles.selectTime}
                    slotProps={{
                      textField: {
                        sx: {
                          '& .MuiInputBase-root': {
                            paddingRight: 1,
                          }
                        }
                      },
                    }}
                    views={['hours', 'minutes']}
                    name="endTime"
                    minTime={formik.values.startTime ?? undefined}
                    value={formik.values.endTime}
                    onChange={handleDateTimeChange('endTime')}
                    onError={timePickerOnError}
                  />
                </Stack>
              </Stack>
            }
            <Stack
              direction={matchDownLg ? matchDownSm ? 'column-reverse' : 'row-reverse' : 'column'}
              width={matchDownLg ? '100%' : undefined}
              spacing={2}
            >
              <Stack
                spacing={{ xs: 2, lg: 1 }}
                direction={matchDownLg ? 'row-reverse' : 'row'}
                sx={{
                  width: '100%'
                }}
              >
                <Box
                  display="inline-flex"
                  alignSelf="center"
                  height="100%"
                  sx={{
                    width: '100%',
                    '& button': {
                      width: '100%'
                    }
                  }}
                >
                  {calcMode === 'calc'
                    ? (formik.values.inProgress)
                      ? (
                        <Button
                          className={styles.startButton}
                          color="error"
                          variant="contained"
                          startIcon={<StopIcon />}
                          onClick={stopClick}
                          disabled={!formik.values.customer}
                        >
                          Стоп
                        </Button>
                      )
                      : (
                        <Button
                          className={styles.startButton}
                          variant="contained"
                          startIcon={<PlayCircleFilledWhiteIcon />}
                          onClick={startClick}
                          disabled={!formik.values.customer}
                        >
                          Начать
                        </Button>
                      )
                    : (
                      <Button
                        className={styles.startButton}
                        variant="contained"
                        onClick={addClick}
                        disabled={!formik.values.customer || !formik.values.duration || !formik.values.description.trim() || customersIsLoading
                          || customersIsFetching || (taskCount > 0 && !formik.values.task)}
                      >
                        Добавить
                      </Button>
                    )}

                </Box>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={calcMode}
                  onChange={calcModeChange}
                  disabled={calcMode === 'calc' && formik.values.inProgress}
                >
                  <Tooltip arrow title="Таймер">
                    <ToggleButton value="calc" style={{ padding: 5 }}>
                      <AccessTimeFilledIcon />
                    </ToggleButton>
                  </Tooltip>
                  <Tooltip arrow title="Вручную">
                    <ToggleButton value="manual" style={{ padding: 5 }}>
                      <EditNoteIcon />
                    </ToggleButton>
                  </Tooltip>
                </ToggleButtonGroup>
              </Stack>
              <Stack
                alignItems="center"
                spacing={1}
                direction={'row'}
              >
                <TextFieldMasked
                  label="Длительность"
                  style={{
                    width: matchDownSm ? '100%' : 117
                  }}
                  mask={durationMask}
                  value={durationFormat(formik.values.duration)}
                  onChange={durationOnChange}
                />
                <Tooltip title={formik.values.billable ? 'Оплачиваемый' : 'Неоплачиваемый'}>
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
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </Form>
      </FormikProvider>
    </CustomizedCard >
  );
};
